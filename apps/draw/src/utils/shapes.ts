import { Point, Shape, ShapeStyle } from "../types/shapes";

export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  style: ShapeStyle
) => {
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;

  ctx.beginPath();
  ctx.strokeStyle = style.strokeColor;
  ctx.fillStyle = style.fillColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.globalAlpha = style.opacity;

  ctx.rect(startPoint.x, startPoint.y, width, height);
  ctx.stroke();
  if (style.fillColor !== "transparent") {
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  style: ShapeStyle
) => {
  // Calculate horizontal and vertical radii separately
  const rx = Math.abs(endPoint.x - startPoint.x);
  const ry = Math.abs(endPoint.y - startPoint.y);

  ctx.beginPath();
  ctx.strokeStyle = style.strokeColor;
  ctx.fillStyle = style.fillColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.globalAlpha = style.opacity;

  // Draw ellipse with calculated radii
  ctx.ellipse(startPoint.x, startPoint.y, rx, ry, 0, 0, Math.PI * 2);
  
  ctx.stroke();
  if (style.fillColor !== "transparent") {
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  style: ShapeStyle
) => {
  ctx.beginPath();
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.globalAlpha = style.opacity;

  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endPoint: Point,
  style: ShapeStyle
) => {
  const headLength = 20;
  const angle = Math.atan2(
    endPoint.y - startPoint.y,
    endPoint.x - startPoint.x
  );

  // Draw the main line
  drawLine(ctx, startPoint, endPoint, style);

  // Draw the arrow head
  ctx.beginPath();
  ctx.moveTo(endPoint.x, endPoint.y);
  ctx.lineTo(
    endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
    endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endPoint.x, endPoint.y);
  ctx.lineTo(
    endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
    endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
};

export const drawFreehand = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  style: ShapeStyle
) => {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.strokeWidth;
  ctx.globalAlpha = style.opacity;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.moveTo(points[0].x, points[0].y);

  // Use quadratic curves for smoother lines
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  ctx.stroke();
  ctx.globalAlpha = 1;
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  text: string,
  style: ShapeStyle
) => {
  ctx.font = "16px Arial";
  ctx.fillStyle = style.strokeColor;
  ctx.globalAlpha = style.opacity;
  ctx.fillText(text, startPoint.x, startPoint.y);
  ctx.globalAlpha = 1;
};

export const renderShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  switch (shape.type) {
    case "rectangle":
      drawRectangle(ctx, shape.startPoint, shape.endPoint, shape.style);
      break;
    case "circle":
      drawCircle(ctx, shape.startPoint, shape.endPoint, shape.style);
      break;
    case "line":
      drawLine(ctx, shape.startPoint, shape.endPoint, shape.style);
      break;
    case "arrow":
      drawArrow(ctx, shape.startPoint, shape.endPoint, shape.style);
      break;
    case "freehand":
      if (shape.points) {
        drawFreehand(ctx, shape.points, shape.style);
      }
      break;
    case "text":
      if (shape.text) {
        drawText(ctx, shape.startPoint, shape.text, shape.style);
      }
      break;
  }

  // Draw selection outline if shape is selected
  if (shape.isSelected) {
    alert("Drawing selection outline");
    ctx.save();
    drawSelectionOutline(ctx, shape);
  }
};

const drawSelectionOutline = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "#0088ff";
  ctx.lineWidth = 1;

  const padding = 5;

  if (shape.type === "circle") {
    const radius = Math.sqrt(
      Math.pow(shape.endPoint.x - shape.startPoint.x, 2) +
        Math.pow(shape.endPoint.y - shape.startPoint.y, 2)
    );
    ctx.beginPath();
    ctx.arc(
      shape.startPoint.x,
      shape.startPoint.y,
      radius + padding,
      0,
      Math.PI * 2
    );
  } else {
    // Default rectangular selection for other shapes
    const minX = Math.min(shape.startPoint.x, shape.endPoint.x) - padding;
    const minY = Math.min(shape.startPoint.y, shape.endPoint.y) - padding;
    const width = Math.abs(shape.endPoint.x - shape.startPoint.x) + padding * 2;
    const height =
      Math.abs(shape.endPoint.y - shape.startPoint.y) + padding * 2;

    ctx.strokeRect(minX, minY, width, height);
  }

  ctx.setLineDash([]);
};
