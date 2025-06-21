
export interface AuthenticatedClient extends WebSocket {
  userId: string;
  userName: string;
  roomId: string | null;
}

export interface Room {
  id: string;
  name: string;
  clients: Map<string, AuthenticatedClient>; // userId -> client
  messages: Message[];
  strokes: Stroke[];
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: "chat" | "draw" | "system";
  stroke?: Stroke;
}

export interface Stroke {
  id: string;
  userId: string;
  userName: string;
  type: ShapeType;
  startPoint: Point;
  endPoint: Point;
  style: ShapeStyle;
  isSelected: boolean;
  points?: Point[];
  text?: string;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// Shape types from your frontend
export type ShapeType = "rectangle" | "circle" | "line" | "arrow" | "text" | "freehand";

export interface Point {
  x: number;
  y: number;
}

export interface ShapeStyle {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
}
