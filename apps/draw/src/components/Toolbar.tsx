import React from "react";
import { useCanvasStore } from "../store/canvas";
import { ShapeType } from "../types/shapes";
import { excalidrawWsService } from "@/services/socket-manager";

const tools: { type: ShapeType; label: string; icon: string }[] = [
  { type: "rectangle", label: "Rectangle", icon: "□" },
  { type: "circle", label: "Circle", icon: "○" },
  { type: "line", label: "Line", icon: "―" },
  { type: "arrow", label: "Arrow", icon: "→" },
  { type: "text", label: "Text", icon: "T" },
  { type: "freehand", label: "Freehand", icon: "✎" },
];

const colors = [
  "#000000",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
];

interface ToolbarProps {
  canvasId: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ canvasId }) => {
  const {
    currentTool,
    currentStyle,
    setCurrentTool,
    updateStyle,
    clear,
    selectedShape,
    deleteShape,
    undo,
    redo,
  } = useCanvasStore();
  
  const handleClear = () => {
    clear();
    excalidrawWsService.clearCanvas(canvasId);
  };

  return (
    <div className="fixed left-4 top-4 bg-white p-3 rounded-lg shadow-md border border-gray-200 space-y-3">
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => setCurrentTool(tool.type)}
              className={`p-2 rounded text-lg flex items-center justify-center w-8 h-8 ${
                currentTool === tool.type
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-2 space-y-2">
        <div className="grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => updateStyle({ strokeColor: color })}
              className={`w-6 h-6 rounded border-2 ${
                currentStyle.strokeColor === color 
                  ? "border-blue-500 ring-1 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-2 space-y-1">
        <div className="text-xs text-gray-500 mb-1">Stroke</div>
        <input
          type="range"
          min="1"
          max="20"
          value={currentStyle.strokeWidth}
          onChange={(e) => updateStyle({ strokeWidth: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="border-t border-gray-200 pt-2 space-y-1">
        <div className="text-xs text-gray-500 mb-1">Opacity</div>
        <input
          type="range"
          min="0"
          max="100"
          value={currentStyle.opacity * 100}
          onChange={(e) =>
            updateStyle({ opacity: Number(e.target.value) / 100 })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="border-t border-gray-200 pt-2 space-y-2">
        <button
          onClick={undo}
          className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center"
          title="Undo"
        >
          Undo
        </button>
        <button
          onClick={redo}
          className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center"
          title="Redo"
        >
          Redo
        </button>
        {selectedShape && (
          <button
            onClick={() => deleteShape(selectedShape.id)}
            className="w-full px-2 py-1.5 text-sm bg-white border border-red-200 text-red-600 rounded hover:bg-red-50 flex items-center justify-center"
            title="Delete selected"
          >
            Delete
          </button>
        )}
        <button
          onClick={handleClear}
          className="w-full px-2 py-1.5 text-sm bg-white border border-red-200 text-red-600 rounded hover:bg-red-50 flex items-center justify-center"
          >
            Clear
          </button>
      </div>
    </div>
  );
};