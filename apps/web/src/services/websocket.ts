interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: "chat" | "draw" | "system" | "ping" | "pong";
  roomId: string;
}

type ConnectionState =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "RECONNECTING"
  | "ERROR";

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private pingInterval: number | null = null;
  private state: ConnectionState = "DISCONNECTED";
  private messageQueue: Array<{
    type: string;
    roomId: string;
    content: string | null;
  }> = [];

  private messageHandlers: ((message: Message) => void)[] = [];
  private roomJoinHandlers: ((roomId: string) => void)[] = [];
  private stateChangeHandlers: ((state: ConnectionState) => void)[] = [];

  private setState(newState: ConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      console.log(`[WS] State changed to: ${newState}`);
      this.stateChangeHandlers.forEach((cb) => cb(newState));
    }
  }

  private startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = window.setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.sendEvent({ type: "ping", roomId: "", content: null });
      }
    }, 30000); // Send ping every 30 seconds
  }

  connect(token: string) {
    if (!token) {
      console.error("[WS] Cannot connect: No token provided");
      this.setState("ERROR");
      return;
    }

    if (this.state === "CONNECTING" || this.state === "CONNECTED") {
      console.log("[WS] Already connected or connecting");
      return;
    }

    this.cleanup();
    this.setState("CONNECTING");
    console.log("[WS] Attempting connection with token");

    try {
      const url = `ws://localhost:4000?token=${encodeURIComponent(token)}`;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("[WS] Connected to WebSocket server");
        this.reconnectAttempts = 0;
        this.setState("CONNECTED");
        this.startPingInterval();
        this.flushMessageQueue();
      };

      this.socket.onclose = (event) => {
        console.log("[WS] Disconnected from WebSocket server", {
          code: event.code,
          reason: event.reason,
        });

        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }

        // Try to reconnect unless explicitly closed
        if (event.code !== 1000) {
          this.setState("RECONNECTING");
          this.tryReconnect(token);
        } else {
          this.setState("DISCONNECTED");
        }
      };

      this.socket.onerror = (error) => {
        console.error("[WS] WebSocket error:", error);
        this.setState("ERROR");
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data) as Message;
          console.log("[WS] Received message:", message);

          if (message.type === "pong") {
            return;
          }

          if (message.type === "system") {
            if (message.content.includes("joined room")) {
              const roomIdMatch = message.content.match(/joined room (\S+)/);
              if (roomIdMatch) {
                const roomId = roomIdMatch[1];
                this.roomJoinHandlers.forEach((cb) => cb(roomId));
              }
            }
          }

          this.messageHandlers.forEach((cb) => cb(message));
        } catch (err) {
          console.error("[WS] Error parsing message:", err);
        }
      };
    } catch (err) {
      console.error("[WS] Connection error:", err);
      this.setState("ERROR");
    }
  }

  private cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.socket) {
      this.socket.close(1000, "Cleanup");
      this.socket = null;
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendEvent(message);
      }
    }
  }

  private tryReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

      console.log(
        `[WS] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = window.setTimeout(() => {
        this.connect(token);
      }, delay);
    } else {
      console.error("[WS] Max reconnection attempts reached");
      this.setState("ERROR");
    }
  }

  disconnect() {
    this.setState("DISCONNECTED");
    this.cleanup();
  }

  joinRoom(roomId: string) {
    this.sendEvent({
      type: "join",
      roomId,
      content: null,
    });
  }

  sendMessage(roomId: string, content: string) {
    this.sendEvent({
      type: "chat",
      roomId,
      content,
    });
  }

  private sendEvent(message: {
    type: string;
    roomId: string;
    content: string | null;
  }) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("[WS] Sending message:", message);
      this.socket.send(JSON.stringify(message));
    } else {
      console.log("[WS] Socket not connected, queueing message");
      this.messageQueue.push(message);
    }
  }

  onMessage(callback: (message: Message) => void) {
    this.messageHandlers.push(callback);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(
        (cb) => cb !== callback
      );
    };
  }

  onRoomJoined(callback: (roomId: string) => void) {
    this.roomJoinHandlers.push(callback);
    return () => {
      this.roomJoinHandlers = this.roomJoinHandlers.filter(
        (cb) => cb !== callback
      );
    };
  }

  onStateChange(callback: (state: ConnectionState) => void) {
    this.stateChangeHandlers.push(callback);
    return () => {
      this.stateChangeHandlers = this.stateChangeHandlers.filter(
        (cb) => cb !== callback
      );
    };
  }

  getState(): ConnectionState {
    return this.state;
  }
}

// Create a single instance that will be shared across the application
export const wsService = new WebSocketService();
