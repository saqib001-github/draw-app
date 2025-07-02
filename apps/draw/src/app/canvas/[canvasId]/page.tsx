"use client";
import React, { useEffect } from "react";
import { Canvas } from "../../../components/Canvas";
import { excalidrawWsService } from "@/services/socket-manager";
import { useAuthStore } from "@/store/auth";

const CanvasPage =({ params }: any) => {
  const { canvasId }:any = React.use(params);
    const { user } = useAuthStore();
  
  useEffect(() => {
    // Initialize WebSocket connection when component mounts
    const token = user?.token;
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
      <Canvas canvasId={canvasId} />
    </div>
  );
};

export default CanvasPage;