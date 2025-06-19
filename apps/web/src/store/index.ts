import { create } from "zustand";
import { wsService } from "../services/websocket";

interface User {
  id: string;
  email: string;
  token: string;
}

interface Room {
  id: string;
  name: string;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface WebSocketMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: "chat" | "draw" | "system";
  roomId: string;
}

type ConnectionState =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "RECONNECTING"
  | "ERROR";

interface AppState {
  user: User | null;
  rooms: Room[];
  currentRoom: Room | null;
  connectionState: ConnectionState;
  isConnected: boolean;

  // User actions
  setUser: (user: User | null) => void;
  addRoom: (room: Room) => void;
  setCurrentRoom: (room: Room | null) => void;
  addMessage: (roomId: string, message: Message) => void;

  // WebSocket actions
  connect: (token: string) => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  setConnectionState: (state: ConnectionState) => void;
}

// Create the store
export const useStore = create<AppState>((set, get) => {
  // Initialize WebSocket event handlers
  const initializeWebSocket = (token: string) => {
    wsService.connect(token);

    // Setup WebSocket event handlers
    wsService.onStateChange((state) => {
      get().setConnectionState(state);
    });

    wsService.onMessage((message) => {
      if (message.type === "chat" && message.roomId) {
        const newMessage = {
          id: message.id,
          content: message.content,
          sender: message.userId,
          timestamp: new Date(message.timestamp).toISOString(),
        };
        get().addMessage(message.roomId, newMessage);
      }
    });

    wsService.onRoomJoined((roomId) => {
      const room = get().rooms.find((r) => r.id === roomId);
      if (room) {
        get().setCurrentRoom(room);
      }
    });
  };

  return {
    user: null,
    rooms: [],
    currentRoom: null,
    connectionState: "DISCONNECTED",
    isConnected: false,

    setUser: (user) => {
      set({ user });
      if (user?.token) {
        initializeWebSocket(user.token);
      } else {
        get().disconnect();
      }
    },

    addRoom: (room) =>
      set((state) => ({
        rooms: [...state.rooms, room],
      })),

    setCurrentRoom: (room) => set({ currentRoom: room }),

    addMessage: (roomId, message) =>
      set((state) => {
        // Find room in rooms array
        const updatedRooms = state.rooms.map((room) =>
          room.id === roomId
            ? { ...room, messages: [...room.messages, message] }
            : room
        );

        // Update currentRoom if it matches
        const updatedCurrentRoom =
          state.currentRoom?.id === roomId
            ? {
                ...state.currentRoom,
                messages: [...state.currentRoom.messages, message],
              }
            : state.currentRoom;

        return {
          rooms: updatedRooms,
          currentRoom: updatedCurrentRoom,
        };
      }),

    connect: (token) => {
      initializeWebSocket(token);
    },

    disconnect: () => {
      wsService.disconnect();
      set({ connectionState: "DISCONNECTED", isConnected: false });
    },

    joinRoom: (roomId) => {
      if (get().connectionState === "CONNECTED") {
        wsService.joinRoom(roomId);
      } else {
        const token = get().user?.token;
        if (token) {
          get().connect(token);
          // Queue the join room action after connection
          wsService.onStateChange((state) => {
            if (state === "CONNECTED") {
              wsService.joinRoom(roomId);
            }
          });
        }
      }
    },

    sendMessage: (roomId: string, content: string) => {
      wsService.sendMessage(roomId,content);
    },

    setConnectionState: (state: ConnectionState) => {
      set({
        connectionState: state,
        isConnected: state === "CONNECTED",
      });
    },
  };
});
