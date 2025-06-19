import React from "react";
import { useCanvasStore } from "../store/canvas";
import { ShapeType } from "../types/shapes";

const tools: { type: ShapeType; label: string; icon: string }[] = [
  { type: "rectangle", label: "Rectangle", icon: "⬜" },
  { type: "circle", label: "Circle", icon: "⭕" },
  { type: "line", label: "Line", icon: "➖" },
  { type: "arrow", label: "Arrow", icon: "➡️" },
  { type: "text", label: "Text", icon: "T" },
  { type: "freehand", label: "Freehand", icon: "✏️" },
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

export const Toolbar: React.FC = () => {
  const {
    currentTool,
    currentStyle,
    setCurrentTool,
    updateStyle,
    clear,
    selectedShape,
    deleteShape,
  } = useCanvasStore();

  return (
    <div className="fixed left-4 top-4 bg-white p-4 rounded-lg shadow-lg space-y-4">
      <div className="space-y-2">
        <h3 className="font-bold">Tools</h3>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => setCurrentTool(tool.type)}
              className={`p-2 rounded ${
                currentTool === tool.type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold">Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => updateStyle({ strokeColor: color })}
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold">Stroke Width</h3>
        <input
          type="range"
          min="1"
          max="20"
          value={currentStyle.strokeWidth}
          onChange={(e) => updateStyle({ strokeWidth: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-bold">Opacity</h3>
        <input
          type="range"
          min="0"
          max="100"
          value={currentStyle.opacity * 100}
          onChange={(e) =>
            updateStyle({ opacity: Number(e.target.value) / 100 })
          }
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <button
          onClick={() => clear()}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All
        </button>

        {selectedShape && (
          <button
            onClick={() => deleteShape(selectedShape.id)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Selected
          </button>
        )}
      </div>
    </div>
  );
};
