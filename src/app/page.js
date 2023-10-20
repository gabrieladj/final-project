"use client"

import React, { useRef, useEffect } from 'react'
import {drawImageProp} from '@/components/drawProps'
import styles from './globals.css'
import Head from 'next/head'


export default function Main(props) {
  const canvasRef = React.useRef(null);

  function drawForeground(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.fillStyle = '#0000CC';
    ctx.beginPath();
    ctx.fillRect(200,40, 20, 20)
    //ctx.arc(100, 100, 20, 0, 2*Math.PI);
    //ctx.fill();
  }
  
  function draw(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    console.log(width + ", " + height);
    ctx.clearRect(0, 0, width, height);
    // ctx.drawImage(background, 0, 0, background.width, background.height,
    // 0, 0, ctx.width, ctx.height); // destination rectangle;
    var background = new Image();
    background.src = '/map.png'
    background.onload = function() {
        //ctx.drawImage(background,0,0);
        drawImageProp(ctx, background, 0, 0, width, height);
        drawForeground(ctx);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
      // we want a square canvas
      // which dimension is smaller?
      if (window.innerWidth < window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;
      }
      else {
        canvas.width = window.innerHeight;
        canvas.height = window.innerHeight;
      }
      draw(ctx)
    }
    resizeCanvas();
    
  }, [draw]);


  return (
    <div>
      <div className={styles.Canvas2D}>
        <canvas data-testid="canvas"
        ref={canvasRef}
        width={600}
        height={600}
        />
      </div>
    </div>
  );
}