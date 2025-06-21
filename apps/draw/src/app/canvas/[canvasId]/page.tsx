// canvas/[canvasId]/page.tsx
"use client";
import React, { useEffect } from "react";
import { Canvas } from "../../../components/Canvas";
import { Toolbar } from "../../../components/Toolbar";
import { excalidrawWsService } from "@/services/socket-manager";

interface CanvasPageProps {
  params: {
    canvasId: string;
  };
}

const CanvasPage =({ params }: any) => {
  const { canvasId }:any = React.use(params);
  useEffect(() => {
    // Initialize WebSocket connection when component mounts
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhlNzRiYWJlLTA4ZjMtNGI0Ni1iOWEwLWRiOWM3Yjc2MjRkZiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3NTA0NDE1NTAsImV4cCI6MTc1MDUyNzk1MH0.B_b6I4siNwjbT11nECkc_xyYELWXYjV0mCi4CmbSN8w" // Or your auth token retrieval method
    if (token) {
      excalidrawWsService.connect(token);
      excalidrawWsService.joinRoom(canvasId);
    }

    return () => {
      // Clean up WebSocket connection when component unmounts
      excalidrawWsService.disconnect();
    };
  }, [canvasId]);

  return (
    <div className="relative w-full h-full bg-gray-50">
      <Toolbar canvasId={canvasId} />
      <Canvas canvasId={canvasId} />
    </div>
  );
};

export default CanvasPage;