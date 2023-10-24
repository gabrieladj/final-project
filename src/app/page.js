"use client"
import React, { useRef, useEffect } from 'react';
import styles from './globals.css';
import Head from 'next/head';
import useSWR from 'swr'


async function fetcher(url) {
  const res = await fetch(url);
  const json = await res.json();
  return json;
}

export default function Main(props) {
  const canvasRef = useRef(null);
  const defaultSize = 720;

  const { data, error } = useSWR('/map-nodes.json', fetcher)

  //if (error) return <div>failed to load</div>;
  if (error) { 
    console.log("error loading json");
    return;
   }
   if (!data) console.log('loading map data...');
  //if (!data) return <div>loading...</div>;

  function drawForeground(ctx) {
    if (!data) { 
      return;
    }
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.font = "12px serif";

    // Drawing paths
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#e8bd20';
    ctx.beginPath();
    Object.keys(data['paths']).map((path, i) => {
      const curr = data['paths'][path];
      console.log(curr);
      ctx.moveTo(curr.x1, curr.y1);
      ctx.lineTo(curr.x2, curr.y2);
    });
    ctx.stroke(); // Render the path

    // Drawing camps (blue squares)
    const campSize = 25; // size of blue square
    Object.keys(data['camps']).map((camp, i) => {
      const curr = data['camps'][camp];
      ctx.fillStyle = '#0000CC';
      ctx.fillRect(curr.x - campSize / 2, curr.y - campSize / 2, campSize, campSize);
      ctx.fillStyle = 'white';
      ctx.fillText((i+1), curr.x-3, curr.y+4);
    });

    

    // Drawing generation points (red circles)
    const circleColor = '#FF0000';
    const circleRadius = 9;
    Object.keys(data['generation_points']).map(gen_point => {
      const curr = data['generation_points'][gen_point];
      ctx.beginPath();
      ctx.arc(curr.x, curr.y, circleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = circleColor;
      ctx.fill();
    });

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
