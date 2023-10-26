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
  const drawNumbers = true;

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
      const node = data['paths'][path];
      console.log(node);
      ctx.beginPath();
      ctx.moveTo(node.x1, node.y1);
      ctx.lineTo(node.x2, node.y2);
      ctx.stroke(); // Render the path
      if (drawNumbers) {
        ctx.fillStyle = 'black';
        ctx.fillText((i+1), (node.x1+node.x2)/2, (node.y1+node.y2)/2);
      }
    });
    //ctx.stroke(); // Render the path

    // Drawing camps (blue squares)
    const campSize = 25; // size of blue square
    ctx.fillStyle = '#0000CC';
    Object.keys(data['camps']).map((camp, i) => {
      const node = data['camps'][camp];
      ctx.fillRect(node.x - campSize / 2, node.y - campSize / 2, campSize, campSize);
      if (drawNumbers) {
        ctx.fillStyle = 'white';
        ctx.fillText((i+1), node.x-3, node.y+4);
        ctx.fillStyle = '#0000CC';
      }
    });

    

    // Drawing generation points (red circles)
    const circleColor = '#FF0000';
    const circleRadius = 9;
    Object.keys(data['generation_points']).map((gen_point, i) => {
      const node = data['generation_points'][gen_point];
      ctx.beginPath();
      ctx.arc(node.x, node.y, circleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = circleColor;
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.fillText(node.letter, node.x-4, node.y+4);
      ctx.fillStyle = circleColor;
      if (drawNumbers) {
        ctx.fillStyle = 'Black';
        ctx.fillText((i+1), node.x+15, node.y+15);
        ctx.fillStyle = circleColor;
      }
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

    // Add event listener for `click` events.
    canvas.addEventListener('click', function(event) {
      var x = event.pageX,
          y = event.pageY;
      alert ("clicked at {x:" + x + ", y:" + y + "}")
    }, false);

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
