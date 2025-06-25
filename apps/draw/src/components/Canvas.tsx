// Canvas.tsx
import React, { useEffect, useRef, MouseEvent, useCallback } from "react";
import { useCanvasStore } from "../store/canvas";
import { renderShape } from "../utils/shapes";
import { nanoid } from "nanoid";
import { Point, Shape, ShapeType } from "../types/shapes";
import { excalidrawWsService } from "../services/socket-manager";
import { useAuthStore } from "../store/auth";
import { api } from "../services/api";

interface CanvasProps {
  canvasId: string;
}

export const Canvas: React.FC<CanvasProps> = ({ canvasId }) => {
  const { user } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    shapes,
    currentTool,
    isDrawing,
    currentStyle,
    addShape,
    updateShape,
    setIsDrawing,
    selectedShape,
    selectShape,
    clearShapes,
    addRemoteShape,
    undo,
    redo,
  } = useCanvasStore();

  const pointsRef = useRef<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to full window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach((shape) => renderShape(ctx, shape));
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Setup WebSocket message handler
    const unsubscribe = excalidrawWsService.onMessage((message) => {
      if (message.type === "draw") {
        if (message.content === "stroke" && message.stroke) {
          // Convert the stroke to our local shape format
          const shape: Shape = {
            id: message.stroke.id,
            type: message.stroke.type,
            startPoint: message.stroke.startPoint,
            endPoint: message.stroke.endPoint,
            style: message.stroke.style,
            isSelected: false,
            points: message.stroke.points,
          };
          addRemoteShape(shape);
        } else if (message.content === "clear") {
          clearShapes();
        }
      }
    });

    // Load initial canvas state from server
    excalidrawWsService.joinRoom(canvasId);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      unsubscribe();
    };
  }, [shapes, canvasId, addRemoteShape, clearShapes]);

  // Load existing strokes when joining a room
  useEffect(() => {
    const loadExistingStrokes = async () => {
      if (!user?.token || !canvasId) return;

      try {
        const data = await api.getRoomStrokes(canvasId, user.token);
        // Convert stored strokes to Shape format and add them to canvas
        data.data.forEach((stroke: any) => {
          const shape: Shape = {
            id: stroke.id,
            type: stroke.type as ShapeType,
            startPoint: JSON.parse(stroke.startPoint),
            endPoint: JSON.parse(stroke.endPoint),
            style: JSON.parse(stroke.style),
            isSelected: false,
            points: stroke.points ? JSON.parse(stroke.points) : undefined,
          };
          addRemoteShape(shape);
        });
      } catch (error) {
        console.error("Failed to load room strokes:", error);
      }
    };

    loadExistingStrokes();
  }, [canvasId, user?.token, addRemoteShape]);

  // Ensure user is authenticated
  useEffect(() => {
    if (!user?.token) {
      window.location.href = "/login";
    }
  }, [user]);

  const getMousePosition = (event: MouseEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (isDrawing) return; // Prevent multiple shapes on rapid mousedown
    const startPoint = getMousePosition(event);
    setIsDrawing(true);

    if (currentTool === "freehand") {
      pointsRef.current = [startPoint];
    }

    // Create a new shape only on mouse down
    const newShape: Shape = {
      id: nanoid(),
      type: currentTool,
      startPoint,
      endPoint: startPoint,
      style: currentStyle,
      isSelected: false,
      points: currentTool === "freehand" ? [startPoint] : undefined,
    };

    addShape(newShape);
  };

  // Throttle updateShape to 1 per 16ms (about 60fps)
  const lastUpdateRef = useRef<number>(0);
  const throttledUpdateShape = useCallback(
    (updatedShape: Shape) => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 16) {
        updateShape(updatedShape);
        lastUpdateRef.current = now;
      }
    },
    [updateShape]
  );

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDrawing) return;
    if (shapes.length === 0) return;

    const currentPoint = getMousePosition(event);
    const lastShape = shapes[shapes.length - 1];

    if (currentTool === "freehand") {
      pointsRef.current.push(currentPoint);
      const updatedShape = {
        ...lastShape,
        points: [...pointsRef.current],
      };
      throttledUpdateShape(updatedShape);
    } else {
      const updatedShape = {
        ...lastShape,
        endPoint: currentPoint,
      };
      throttledUpdateShape(updatedShape);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    if (shapes.length === 0) return;
    const lastShape = shapes[shapes.length - 1];
    // Send the final shape to server only once when drawing is complete
    excalidrawWsService.sendStroke(canvasId, {
      id: lastShape.id,
      userId: "current-user-id",
      userName: "Current User",
      type: lastShape.type,
      startPoint: lastShape.startPoint,
      endPoint: lastShape.endPoint,
      style: lastShape.style,
      isSelected: false,
      points: lastShape.points,
      timestamp: new Date(),
    });
    setIsDrawing(false);
    pointsRef.current = [];
  };

  const handleClick = (event: MouseEvent) => {
    const clickPoint = getMousePosition(event);

    // Find clicked shape
    const clickedShape = [...shapes].reverse().find((shape) => {
      if (shape.type === "circle") {
        const radius = Math.sqrt(
          Math.pow(shape.endPoint.x - shape.startPoint.x, 2) +
            Math.pow(shape.endPoint.y - shape.startPoint.y, 2)
        );
        const distance = Math.sqrt(
          Math.pow(clickPoint.x - shape.startPoint.x, 2) +
            Math.pow(clickPoint.y - shape.startPoint.y, 2)
        );
        return distance <= radius;
      } else {
        const minX = Math.min(shape.startPoint.x, shape.endPoint.x);
        const maxX = Math.max(shape.startPoint.x, shape.endPoint.x);
        const minY = Math.min(shape.startPoint.y, shape.endPoint.y);
        const maxY = Math.max(shape.startPoint.y, shape.endPoint.y);

        return (
          clickPoint.x >= minX &&
          clickPoint.x <= maxX &&
          clickPoint.y >= minY &&
          clickPoint.y <= maxY
        );
      }
    });

    // Update selection
    shapes.forEach((shape) => {
      if (shape.id === clickedShape?.id) {
        selectShape({ ...shape, isSelected: true });
      } else if (shape.isSelected) {
        updateShape({ ...shape, isSelected: false });
      }
    });
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      style={{
        cursor: isDrawing ? "crosshair" : "default",
      }}
    />
  );
};
