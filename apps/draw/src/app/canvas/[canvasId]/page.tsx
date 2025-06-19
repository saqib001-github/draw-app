"use client";
import React from "react";
import { Canvas } from "../../../components/Canvas";
import { Toolbar } from "../../../components/Toolbar";

const CanvasPage = () => {
  return (
    <div className="relative w-full h-full bg-gray-50">
      <Toolbar />
      {/* <div className="flex items-center justify-center p-4 h-full"> */}
        <Canvas />
      {/* </div> */}
    </div>
  );
};

export default CanvasPage;
