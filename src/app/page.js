"use client"
import React, { useRef, useEffect } from 'react';
import styles from './globals.css';
import Head from 'next/head';

export default function Main(props) {
  const canvasRef = useRef(null);
  const defaultSize = 720;

  function drawForeground(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const camp1 = { x: 185, y: 45 };
    const camp2 = { x: 110, y: 145 };
    const camp3 = {x:80, y:350};
    const camp4 = {x:140,y:450};
    const camp5 = {x:350,y:600};
    const greenCamp = {x:480,y:670};
    const camp6 = {x:550,y:650};
    const camp7 = {x:630,y:610}
    const camp8 = {x:630,y:560}
    const camp9 = {x:630,y:380}
    const camp10 = {x:450,y:380}


    const campSize = 20;

    ctx.fillStyle = '#0000CC';
    ctx.strokeStyle = '#e8bd20';
    ctx.beginPath();
    ctx.moveTo(camp1.x, camp1.y);
    ctx.lineTo(camp2.x, camp2.y);
    ctx.moveTo(camp2.x,camp2.y);
    ctx.lineTo(camp3.x,camp3.y);
    ctx.moveTo(camp3.x,camp3.y);
    ctx.lineTo(camp4.x,camp4.y);
    ctx.moveTo(camp4.x,camp4.y);
    ctx.lineTo(camp5.x,camp5.y);
    ctx.moveTo(camp5.x,camp5.y);
    ctx.lineTo(greenCamp.x,greenCamp.y);
    ctx.moveTo(greenCamp.x,greenCamp.y);
    ctx.lineTo(camp6.x,camp6.y);
    ctx.moveTo(camp6.x,camp6.y);
    ctx.lineTo(camp7.x,camp7.y);
    ctx.moveTo(camp7.x,camp7.y);
    ctx.lineTo(camp8.x,camp8.y);
    ctx.moveTo(camp8.x,camp8.y);
    ctx.lineTo(camp9.x,camp9.y);
    ctx.moveTo(camp9.x,camp9.y);
    ctx.lineTo(camp10.x,camp10.y);

    
    ctx.lineWidth = 5;
    ctx.stroke(); // Render the path
    ctx.fillRect(camp1.x - campSize / 2, camp1.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp2.x - campSize / 2, camp2.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp3.x - campSize / 2, camp3.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp4.x - campSize / 2, camp4.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp5.x - campSize / 2, camp5.y - campSize / 2, campSize, campSize);
    ctx.fillRect(greenCamp.x - campSize / 2, greenCamp.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp6.x - campSize / 2, camp6.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp7.x - campSize / 2, camp7.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp8.x - campSize / 2, camp8.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp9.x - campSize / 2, camp9.y - campSize / 2, campSize, campSize);
    ctx.fillRect(camp10.x - campSize / 2, camp10.y - campSize / 2, campSize, campSize);  

    // Draw circle 1 in nevada in the middle of the canvas
    const cx1 = 290;
    const cy1 = 320;
    const radiusN1 = 10;
    const circleColor = '#FF0000';
    

    // Draw circle 2 in nevada
    const cx2 = 200
    const cy2 =  400;
    const radiusN2 = 7;

    // Draw circle 3 in nevada
    const cx3 = 160;
    const cy3 =  290;
    const radiusN3 = 15;
    
    


    ctx.beginPath();
    ctx.arc(cx1, cy1, radiusN1, 0, 2 * Math.PI);
    //ctx.arc(cx2, cy2, radiusN2, 0, 2 * Math.PI);
    ctx.arc(cx3, cy3, radiusN3, 0, 2 * Math.PI);
    ctx.fillStyle = circleColor;
    ctx.fill();

    //Draw a circle 1 in Mexico
    const cxM1 = 250;
    const cyM1 = 450;
    const radiusM1 = 15;
    
    //Draw a circle 2 in Mexico
    const cxM2 = 390;
    const cyM2 = 450;
    const radiusM2 = 11;


    ctx.beginPath();
    ctx.arc(cxM1,cyM1,radiusM1,0,2*Math.PI);
    ctx.arc(cxM2,cyM2,radiusM2,0,2*Math.PI);
    
    ctx.fillStyle = circleColor;
    ctx.fill();

     //Draw a circle 1 in California
     const cxC1 = 180;
     const cyC1 = 480;
     const radiusC1 = 22;
     ctx.beginPath();
     ctx.arc(cxC1,cyC1,radiusC1,0,2*Math.PI);
     ctx.fillStyle = circleColor;
     ctx.fill();



  }

  function draw(ctx) {
    drawForeground(ctx);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
      const pixelRatio = 1; // window.devicePixelRatio || 1;
      var size = defaultSize;
      if (window.innerWidth < window.innerHeight) {
        size = window.innerWidth;
        canvas.width = size;
        canvas.height = size;
      } else {
        size = window.innerHeight;
        canvas.width = size;
        canvas.height = size;
      }
      ctx.scale(size / defaultSize, size / defaultSize);
      draw(ctx);
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
