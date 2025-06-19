export type Point = {
  x: number;
  y: number;
};

export type ShapeType =
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "freehand";

export type ShapeStyle = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
};

export type Shape = {
  id: string;
  type: ShapeType;
  startPoint: Point;
  endPoint: Point;
  style: ShapeStyle;
  isSelected: boolean;
  points?: Point[]; // For freehand drawing
  text?: string; // For text elements
};

export type ToolbarItem = {
  type: ShapeType;
  icon: string;
  label: string;
};
