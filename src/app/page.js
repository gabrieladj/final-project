"use client"

import React, { useRef, useEffect } from 'react'
import {drawImageProp} from '@/components/drawProps'
import styles from './globals.css'
import Head from 'next/head'


export default function Main(props) {
  const canvasRef = React.useRef(null);

  const defaultSize = 720;

  function drawForeground(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const camp1 = { x: 185, y: 45 };
    const camp2 = { x: 150, y: 145 };
    const campSize = 20;

    ctx.fillStyle = '#0000CC';
    ctx.strokeStyle = '#e8bd20';
    ctx.beginPath();
    ctx.moveTo(camp1.x,camp1.y);
    ctx.lineTo(camp2.x,camp2.y);
    ctx.lineWidth = 5;
    ctx.stroke(); // Render the path
    ctx.fillRect(camp1.x-campSize/2, camp1.y-campSize/2, campSize, campSize);
    ctx.fillRect(camp2.x-campSize/2, camp2.y-campSize/2, campSize, campSize);
    

  }
  
  function draw(ctx) {
    drawForeground(ctx);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
      const pixelRatio = 1;//window.devicePixelRatio || 1;
      var size = defaultSize;
      // we want a square canvas
      // which dimension is smaller?
      if (window.innerWidth < window.innerHeight) {
        size = window.innerWidth;
        canvas.width = size;
        canvas.height = size;
      }
      else {
        size = window.innerHeight;
        canvas.width = size;
        canvas.height = size;
      }
      ctx.scale(size/defaultSize, size/defaultSize);
      draw(ctx)
    }
    resizeCanvas();
    
  }, [draw]);


  return (
    <div className="centered-container">
      <div id="canvas-container" className={styles.Canvas2D}>
        {/* Add a background image as a CSS background */}
        <div className="CanvasBackground" />
        <canvas data-testid="canvas" ref={canvasRef} width={defaultSize} height={defaultSize} />
      </div>
    </div>
  );
}