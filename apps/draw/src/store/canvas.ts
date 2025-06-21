import { create } from "zustand";
import { Shape, ShapeType, Point } from "../types/shapes";

interface CanvasState {
  shapes: Shape[];
  selectedShape: Shape | null;
  currentTool: ShapeType;
  isDrawing: boolean;
  currentStyle: {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    opacity: number;
  };
  canvasId: string | null;

  // Actions
  setCurrentTool: (tool: ShapeType) => void;
  addShape: (shape: Shape) => void;
  updateShape: (shape: Shape) => void;
  deleteShape: (shapeId: string) => void;
  selectShape: (shape: Shape | null) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  updateStyle: (style: Partial<typeof initialState.currentStyle>) => void;
  clear: () => void;
  addRemoteShape: (shape: Shape) => void;
  clearShapes: () => void;
}

const initialState = {
  shapes: [],
  selectedShape: null,
  currentTool: "rectangle" as ShapeType,
  isDrawing: false,
  currentStyle: {
    strokeColor: "#000000",
    fillColor: "transparent",
    strokeWidth: 2,
    opacity: 1,
  },
  canvasId: null,
};

export const useCanvasStore = create<CanvasState>((set) => ({
  ...initialState,

  setCurrentTool: (tool) => set({ currentTool: tool }),

  addShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, shape],
    })),

  updateShape: (shape) =>
    set((state) => ({
      shapes: state.shapes.map((s) => (s.id === shape.id ? shape : s)),
    })),

  deleteShape: (shapeId) =>
    set((state) => ({
      shapes: state.shapes.filter((s) => s.id !== shapeId),
      selectedShape:
        state.selectedShape?.id === shapeId ? null : state.selectedShape,
    })),

  selectShape: (shape) => set({ selectedShape: shape }),

  setIsDrawing: (isDrawing) => set({ isDrawing }),

  updateStyle: (style) =>
    set((state) => ({
      currentStyle: { ...state.currentStyle, ...style },
    })),

  clear: () => set(initialState),

  addRemoteShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, shape],
    })),

  clearShapes: () => set(initialState),
}));
