import React, { useEffect, useRef, MouseEvent } from "react";
import { useCanvasStore } from "../store/canvas";
import { renderShape } from "../utils/shapes";
import { nanoid } from "nanoid";
import { Point, Shape } from "../types/shapes";

export const Canvas: React.FC = () => {
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
  } = useCanvasStore();

  // Keep track of temporary points for freehand drawing
  const pointsRef = useRef<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render all shapes
    shapes.forEach((shape) => renderShape(ctx, shape));
  }, [shapes]);

  const getMousePosition = (event: MouseEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (event: MouseEvent) => {
    const startPoint = getMousePosition(event);
    setIsDrawing(true);

    if (currentTool === "freehand") {
      pointsRef.current = [startPoint];
    }

    // Create a new shape
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

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDrawing) return;

    const currentPoint = getMousePosition(event);
    const lastShape = shapes[shapes.length - 1];

    if (currentTool === "freehand") {
      pointsRef.current.push(currentPoint);
      updateShape({
        ...lastShape,
        points: [...pointsRef.current],
      });
    } else {
      updateShape({
        ...lastShape,
        endPoint: currentPoint,
      });
    }
  };

  const handleMouseUp = () => {
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

  return (
    <canvas
      ref={canvasRef}
      width={window.outerWidth}
      height={window.outerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      style={{
        // border: "1px solid #ccc",
        cursor: isDrawing ? "crosshair" : "default",
      }}
    />
  );
};
