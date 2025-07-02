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
  undoStack: Shape[][];
  redoStack: Shape[][];

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
  undo: () => void;
  redo: () => void;
  setCurrentStyle: (style: {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    opacity: number;
  }) => void;
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
  undoStack: [],
  redoStack: [],
};

export const useCanvasStore = create<CanvasState>((set) => ({
  ...initialState,

  setCurrentTool: (tool) => set({ currentTool: tool }),

  addShape: (shape) =>
    set((state) => ({
      undoStack: [...state.undoStack, state.shapes],
      redoStack: [],
      shapes: [...state.shapes, shape],
    })),

  updateShape: (shape) =>
    set((state) => ({
      redoStack: [],
      shapes: state.shapes.map((s) => (s.id === shape.id ? shape : s)),
    })),

  deleteShape: (shapeId) =>
    set((state) => ({
      undoStack: [...state.undoStack, state.shapes],
      redoStack: [],
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

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return {
        shapes: prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [state.shapes, ...state.redoStack],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[0];
      return {
        shapes: next,
        undoStack: [...state.undoStack, state.shapes],
        redoStack: state.redoStack.slice(1),
      };
    }),

  setCurrentStyle: (style) =>
    set((state) => ({
      currentStyle: { ...state.currentStyle, ...style },
    })),
}));
