import React, {
  useEffect,
  useRef,
  MouseEvent,
  useState,
} from "react";
import { useCanvasStore } from "../store/canvas";
import { renderShape } from "../utils/shapes";
import { nanoid } from "nanoid";
import { Point, Shape, ShapeType } from "../types/shapes";
import { excalidrawWsService } from "../services/socket-manager";
import { useAuthStore } from "../store/auth";
import { api } from "../services/api";
import {
  MousePointer,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Edit3,
  Undo2,
  Redo2,
  Trash2,
  Users,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";

interface CanvasProps {
  canvasId: string;
}

export const Canvas: React.FC<CanvasProps> = ({ canvasId }) => {
  const { user } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const currentShapeIdRef = useRef<string | null>(null);

  const tools = [
    { type: "select", icon: MousePointer, name: "Select", shortcut: "V" },
    { type: "rectangle", icon: Square, name: "Rectangle", shortcut: "R" },
    { type: "circle", icon: Circle, name: "Circle", shortcut: "C" },
    { type: "line", icon: Minus, name: "Line", shortcut: "L" },
    { type: "arrow", icon: ArrowRight, name: "Arrow", shortcut: "A" },
    { type: "text", icon: Type, name: "Text", shortcut: "T" },
    { type: "freehand", icon: Edit3, name: "Freehand", shortcut: "P" },
  ];

  const colors = [
    "#000000",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffffff",
    "#8B5CF6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6366F1",
    "#84CC16",
    "#F97316",
    "#EC4899",
  ];

  const strokeWidths = [1, 2, 4, 8, 12];

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
        clearShapes(); // Clear before loading to avoid duplicates
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
  }, [canvasId, user?.token, addRemoteShape, clearShapes]);

  // Ensure user is authenticated
  useEffect(() => {
    if (!user?.token) {
      window.location.href = "/auth";
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
    if (isDrawing) return;
    const startPoint = getMousePosition(event);
    setIsDrawing(true);

    pointsRef.current = [startPoint];

    const newShape: Shape = {
      id: nanoid(),
      type: currentTool,
      startPoint,
      endPoint: startPoint,
      style: currentStyle,
      isSelected: false,
      points: currentTool === "freehand" ? [startPoint] : undefined,
    };

    currentShapeIdRef.current = newShape.id;
    addShape(newShape);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDrawing || !currentShapeIdRef.current) return;

    const currentPoint = getMousePosition(event);
    const currentShape = shapes.find(
      (shape) => shape.id === currentShapeIdRef.current
    );
    if (!currentShape) return;

    if (currentTool === "freehand") {
      pointsRef.current.push(currentPoint);
      const updatedShape = {
        ...currentShape,
        points: [...pointsRef.current],
        endPoint: currentPoint,
      };
      updateShape(updatedShape);
    } else {
      const updatedShape = {
        ...currentShape,
        endPoint: currentPoint,
      };
      updateShape(updatedShape);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentShapeIdRef.current) return;

    const currentShape = shapes.find(
      (shape) => shape.id === currentShapeIdRef.current
    );
    if (currentShape) {
      excalidrawWsService.sendStroke(canvasId, {
        id: currentShape.id,
        userId: user?.id || "unknown-user",
        userName: user?.email || "Unknown User",
        type: currentShape.type,
        startPoint: currentShape.startPoint,
        endPoint: currentShape.endPoint,
        style: currentShape.style,
        isSelected: false,
        points: currentShape.points,
        timestamp: new Date(),
      });
    }

    setIsDrawing(false);
    pointsRef.current = [];
    currentShapeIdRef.current = null;
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
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        redo();
      } else if (e.key === "h" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsToolbarVisible(!isToolbarVisible);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, isToolbarVisible]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      {/* Top Navigation Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${isToolbarVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Edit3 className="w-4 h-4 text-white dark:text-black" />
              </div>
              <span className="text-lg font-bold">DrawFlow</span>
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Room: {canvasId.slice(0, 8)}...
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4" />
              <span>{connectedUsers} online</span>
            </div>
            <button
              onClick={() => setIsToolbarVisible(!isToolbarVisible)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Toggle toolbar (H)"
            >
              {isToolbarVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Left Toolbar */}
      <div
        className={`absolute left-4 top-20 z-40 transition-all duration-300 ${isToolbarVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
          {/* Tools */}
          <div className="space-y-2 mb-4">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.type}
                  onClick={() =>
                    useCanvasStore
                      .getState()
                      .setCurrentTool(tool.type as ShapeType)
                  }
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    currentTool === tool.type
                      ? "bg-blue-500 text-white shadow-lg scale-105"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                  title={`${tool.name} (${tool.shortcut})`}
                >
                  <IconComponent className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

          {/* Color Palette */}
          <div className="space-y-2 mb-4">
            <button
              onClick={() => setIsColorPaletteOpen(!isColorPaletteOpen)}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Colors"
            >
              <div
                className="w-6 h-6 rounded border-2 border-white shadow-sm"
                style={{
                  backgroundColor: currentStyle.strokeColor || "#000000",
                }}
              />
            </button>

            {isColorPaletteOpen && (
              <div className="absolute left-full ml-2 top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="grid grid-cols-4 gap-2 w-32">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        useCanvasStore.getState().setCurrentStyle({
                          ...currentStyle,
                          strokeColor: color,
                        });
                        setIsColorPaletteOpen(false);
                      }}
                      className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                        currentStyle.fillColor || "" === color
                          ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stroke Width */}
          <div className="space-y-2 mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Stroke
            </div>
            <div className="space-y-1">
              {strokeWidths.map((width) => (
                <button
                  key={width}
                  onClick={() =>
                    useCanvasStore.getState().setCurrentStyle({
                      ...currentStyle,
                      strokeWidth: width,
                    })
                  }
                  className={`w-10 h-6 rounded flex items-center justify-center transition-colors ${
                    currentStyle.strokeWidth === width
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div
                    className="bg-current rounded-full"
                    style={{
                      width: `${Math.max(width, 2)}px`,
                      height: `${Math.max(width, 2)}px`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={undo}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearShapes}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${isToolbarVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>{shapes.length} objects</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div>
              {currentTool === "freehand"
                ? "Drawing"
                : `${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)} tool`}
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-xs">
              Press{" "}
              <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                H
              </kbd>{" "}
              to toggle toolbar
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        className={`absolute inset-0 ${isDrawing ? "cursor-crosshair" : "cursor-default"}`}
      />
    </div>
  );
};
