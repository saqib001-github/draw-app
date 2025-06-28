import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import prisma from "@repo/database"
import { parse } from "url";
import { verifyJwtToken } from "@repo/common";
import { AuthenticatedClient, Message, Room, Stroke, User } from "types";

dotenv.config();

class WebSocketManager {
  private wss: WebSocketServer;
  private rooms: Map<string, Room>;
  private users: Map<string, User>;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.rooms = new Map();
    this.users = new Map();
    this.initialize();
  }

  private initialize(): void {
    this.wss.on("connection", this.handleConnection.bind(this));
    console.log(
      `WebSocket Server running on port ${process.env.WS_PORT || 4000}`
    );
  }

  private checkUser(token: string): User | null {
    try {
      const decoded = verifyJwtToken(token, process.env.JWT_SECRET!) as {
        id: string;
        email: string;
        name: string;
      };
      return decoded
        ? { id: decoded.id, email: decoded.email, name: decoded.name }
        : null;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return null;
    }
  }

  private async handleConnection(
    ws: WebSocket & AuthenticatedClient,
    req: any
  ): Promise<void> {
    try {
      const { query } = parse(req.url || "", true);
      const token = query.token as string;

      console.log("[WS] New connection attempt", {
        url: req.url,
        hasToken: !!token,
      });

      if (!token) {
        console.log("[WS] Connection rejected: No token provided");
        ws.close(1008, "Authentication failed - No token provided");
        return;
      }

      const user = this.checkUser(token);
      console.log("[WS] User authentication result:", {
        authenticated: !!user,
        userId: user?.id,
        userName: user?.name,
      });

      if (!user) {
        console.log("[WS] Connection rejected: Invalid token");
        ws.close(1008, "Authentication failed - Invalid token");
        return;
      }

      // Initialize client properties
      ws.userId = user.id;
      ws.userName = user.name;
      ws.roomId = null;

      console.log("[WS] Client successfully connected:", {
        userId: ws.userId,
        userName: ws.userName,
      });

      // Store user
      this.users.set(user.id, user);

      // Set up message handler
      ws.on("message", (data: string) => this.handleMessage(ws, data));
      ws.on("close", () => {
        console.log("[WS] Client disconnecting:", {
          userId: ws.userId,
          userName: ws.userName,
          wasInRoom: ws.roomId,
        });
        this.handleDisconnection(ws);
      });

      // Send initial state
      this.sendToClient(ws, {
        type: "system",
        content: "Connected to server",
        userId: "system",
        userName: "System",
        id: crypto.randomUUID(),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[WS] Connection error:", error);
      ws.close(1008, "Internal server error");
    }
  }

  private handleMessage(ws: AuthenticatedClient, data: string): void {
    try {
      const message = JSON.parse(data) as {
        type: "join" | "leave" | "chat" | "draw" | "clear";
        roomId?: string;
        content?: any;
        stroke?: Stroke;
      };

      switch (message.type) {
        case "join":
          this.handleJoinRoom(ws, message.roomId!);
          break;
        case "leave":
          this.handleLeaveRoom(ws);
          break;
        case "chat":
          this.handleChatMessage(ws, message);
          break;
        case "draw":
          this.handleDrawMessage(ws, message);
          break;
        case "clear":
          this.handleClearCanvas(ws);
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Message handling error:", error);
      this.sendToClient(ws, {
        type: "system",
        content: "Error processing message",
        userId: "system",
        userName: "System",
        id: crypto.randomUUID(),
        timestamp: new Date(),
      });
    }
  }

  private handleJoinRoom(ws: AuthenticatedClient, roomId: string): void {
    // Leave current room if in one
    if (ws.roomId) {
      this.handleLeaveRoom(ws);
    }

    // Get or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        name: `Room ${roomId}`,
        clients: new Map(),
        messages: [],
        strokes: [],
      };
      this.rooms.set(roomId, room);
    }

    // Add client to room
    room.clients.set(ws.userId, ws);
    ws.roomId = roomId;

    // Notify room about new user
    const joinMessage: Message = {
      type: "system",
      content: `${ws.userName} joined the room`,
      userId: "system",
      userName: "System",
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    this.broadcastToRoom(room, joinMessage);

    // Send room history to new user
    room.messages.forEach((msg) => this.sendToClient(ws, msg));
    
    // Send all existing strokes to the new user
    room.strokes.forEach((stroke) => {
      this.sendToClient(ws, {
        type: "draw",
        content: "stroke",
        stroke: stroke,
        userId: stroke.userId,
        userName: stroke.userName,
        id: stroke.id,
        timestamp: stroke.timestamp,
      });
    });
  }

  private handleLeaveRoom(ws: AuthenticatedClient): void {
    if (!ws.roomId) return;

    const room = this.rooms.get(ws.roomId);
    if (room) {
      room.clients.delete(ws.userId);

      // Notify room about user leaving
      const leaveMessage: Message = {
        type: "system",
        content: `${ws.userName} left the room`,
        userId: "system",
        userName: "System",
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      this.broadcastToRoom(room, leaveMessage);

      // Clean up empty rooms
      if (room.clients.size === 0) {
        this.rooms.delete(room.id);
      }
    }

    ws.roomId = null;
  }

  private async handleChatMessage(ws: AuthenticatedClient, message: any): Promise<void> {
    if (!ws.roomId) {
      this.sendToClient(ws, {
        type: "system",
        content: "You must join a room first",
        userId: "system",
        userName: "System",
        id: crypto.randomUUID(),
        timestamp: new Date(),
      });
      return;
    }

    const room = this.rooms.get(ws.roomId);
    if (!room) return;

    const formattedMessage: Message = {
      id: crypto.randomUUID(),
      type: "chat",
      content: message.content,
      userId: ws.userId,
      userName: ws.userName,
      timestamp: new Date(),
    };

    // Store message history
    room.messages.push(formattedMessage);
    if (room.messages.length > 100) {
      room.messages.shift(); // Keep only last 100 messages
    }
    
    this.broadcastToRoom(room, formattedMessage);
    await prisma.chat.create({
      data:{
        roomId: ws.roomId,
        userId: ws.userId,
        message: message.content,
      }
    })
  }

  private handleDrawMessage(ws: AuthenticatedClient, message: any): void {
    if (!ws.roomId) {
      this.sendToClient(ws, {
        type: "system",
        content: "You must join a room first",
        userId: "system",
        userName: "System",
        id: crypto.randomUUID(),
        timestamp: new Date(),
      });
      return;
    }

    const room = this.rooms.get(ws.roomId);
    if (!room) return;

    // Create a new stroke
    const stroke: Stroke = {
      id: crypto.randomUUID(),
      userId: ws.userId,
      userName: ws.userName,
      type: message.stroke.type,
      startPoint: message.stroke.startPoint,
      endPoint: message.stroke.endPoint,
      style: message.stroke.style,
      isSelected: message.stroke.isSelected || false,
      points: message.stroke.points,
      text: message.stroke.text,
      timestamp: new Date(),
    };

    // Store the stroke
    room.strokes.push(stroke);

    // Broadcast the stroke to all clients in the room
    const drawMessage: Message = {
      id: stroke.id,
      type: "draw",
      content: "stroke",
      userId: ws.userId,
      userName: ws.userName,
      timestamp: stroke.timestamp,
      stroke: stroke,
    };

    this.broadcastToRoom(room, drawMessage);
    // Removed prisma.stroke.create to avoid storing shapes in the database as per user request
    // prisma.stroke.create({
    //   data:{
    //     roomId: ws.roomId,
    //     userId: ws.userId,
    //     type: stroke.type,
    //     startPoint: JSON.stringify(stroke.startPoint),
    //     endPoint: JSON.stringify(stroke.endPoint),
    //     style: JSON.stringify(stroke.style),
    //     isSelected: stroke.isSelected,
    //     points: stroke.points ? JSON.stringify(stroke.points) : [],
    //     text: stroke.text || null,
    //   }
    // })
  }

  private handleClearCanvas(ws: AuthenticatedClient): void {
    if (!ws.roomId) return;

    const room = this.rooms.get(ws.roomId);
    if (!room) return;

    // Clear all strokes for the room
    room.strokes = [];

    // Broadcast clear command to all clients
    const clearMessage: Message = {
      id: crypto.randomUUID(),
      type: "draw",
      content: "clear",
      userId: ws.userId,
      userName: ws.userName,
      timestamp: new Date(),
    };

    this.broadcastToRoom(room, clearMessage);
  }

  private handleDisconnection(ws: AuthenticatedClient): void {
    this.handleLeaveRoom(ws);
    this.users.delete(ws.userId);
    console.log(`Client ${ws.userName} disconnected`);
  }

  private broadcastToRoom(room: Room, message: Message): void {
    room.clients.forEach((client) => {
      this.sendToClient(client, message);
    });
  }

  private sendToClient(client: AuthenticatedClient, message: Message): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

// Start the WebSocket server
new WebSocketManager(parseInt(process.env.WS_PORT || "4000"));