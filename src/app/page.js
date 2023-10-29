"use client"
import React, { useState, useRef, useEffect } from 'react';
import styles from './globals.css';
import Head from 'next/head';
import useSWR from 'swr'
import get_camp_stats from '../lib/stats'
import { getNameOfJSDocTypedef } from 'typescript';

async function fetcher(url) {
  const res = await fetch(url);
  const json = await res.json();
  return json;
}

function loadImages(sources, callback) {
  var newImages = {};
  var loadedImages = 0;
  var numImages = 0;
  // get num of sources
  for(var src in sources) {
    numImages++;
  }
  for(var src in sources) {
    newImages[src] = new Image();
    newImages[src].onload = function() {
      if(++loadedImages >= numImages) {
        callback(newImages);
      }
    };
    newImages[src].src = sources[src];
  }
}

export default function Main(props) {
  const canvasRef = useRef(null);
  const defaultSize = 720;
  var drawCampNum = true,
      drawGenNum = false,
      drawPathNum = false;
  const [imgLoaded, setImgLoaded] = useState(false);
  var images = null;

  const { data, error } = useSWR('/map-nodes.json', fetcher)

  if (error) { 
    console.log("error loading json");
    return;
  }
  if (!data) console.log('loading map data...');

  function drawStats(ctx, position, stats) {
    const ySpacing = 21;
    const imgSize = 20;
    
    ctx.font = "12px serif";
    ctx.fillStyle = 'black';

    position.x = position.x + 25;
    position.y = position.y - 10;

    if (images != null ) {
        ctx.drawImage(images.food, position.x, position.y-32, imgSize, imgSize);
        ctx.drawImage(images.house, position.x, position.y+imgSize-32, imgSize, imgSize);
        ctx.drawImage(images.health, position.x, position.y+imgSize*2-32, imgSize, imgSize);
        ctx.drawImage(images.admin, position.x, position.y+imgSize*3-32, imgSize, imgSize);
    }
    ctx.fillText(stats.foodLevel, position.x+imgSize+5, position.y-20);
    ctx.fillText(stats.housingLevel, position.x+imgSize+5, position.y+ySpacing-20);
    ctx.fillText(stats.healthcareLevel, position.x+imgSize+5, position.y+ySpacing*2-20);
    ctx.fillText(stats.administrationLevel, position.x+imgSize+5, position.y+ySpacing*3-20);
  }

  function draw(ctx) {
    // if the data object loaded?
    if (!data) { return; }
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.font = "12px serif";

    // Drawing paths (do this first so nodes are rendered on top)
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#e8bd20';
    ctx.beginPath();
    Object.keys(data['paths']).map((path, i) => {
      const node = data['paths'][path];
      const startNode = data['paths'][path].start;
      const endNode = data['paths'][path].end;
      var startCoord = {x: 0, y: 0};
      var endCoord = {x: 0, y: 0};
      // get the x and y of the camp or gen point
      // start node is camp
      if (startNode.startsWith('c')) {
        startCoord.x = data['camps'][startNode.substr(1)].x;
        startCoord.y = data['camps'][startNode.substr(1)].y;
      }
      // start node is generation point
      else if (startNode.startsWith('g')) {
        startCoord.x = data['generation_points'][startNode.substr(1)].x;
        startCoord.y = data['generation_points'][startNode.substr(1)].y;
      }
      // end node is camp
      if (endNode.startsWith('c')) {
        endCoord.x = data['camps'][endNode.substr(1)].x;
        endCoord.y = data['camps'][endNode.substr(1)].y;
      }
      // end node is generation point
      else if (endNode.startsWith('g')) {
        endCoord.x = data['generation_points'][endNode.substr(1)].x;
        endCoord.y = data['generation_points'][endNode.substr(1)].y;
      }

      // ready to draw
      ctx.beginPath();
      ctx.moveTo(startCoord.x, startCoord.y);
      // if control points exist, draw a bezier (curved) line
      if (data['paths'][path]['cp1'] != null && data['paths'][path]['cp2'] != null)
      {
        const cp1 = data['paths'][path]['cp1'];
        const cp2 = data['paths'][path]['cp2'];
        ctx.bezierCurveTo(startCoord.x+cp1.x, startCoord.y+cp1.y, 
          endCoord.x+cp2.x, endCoord.y+cp2.y, endCoord.x, endCoord.y);
        ctx.stroke(); // Render the path
      }
      else // no control points, straight line from a to b
      {
        console.log("bezier line");
        ctx.lineTo(endCoord.x, endCoord.y);
        ctx.stroke(); // Render the path
      }
      // for debugging
      if (drawPathNum) {
        ctx.fillStyle = 'black';
        ctx.fillText((i+1), (startCoord.x+endCoord.x)/2, (startCoord.y+endCoord.y)/2);
      }
    });

    // Drawing camps (blue squares)
    const campSize = 25; // size of blue square
    Object.keys(data['camps']).map((camp, i) => {
      ctx.fillStyle = '#0000CC';
      const node = data['camps'][camp];
      ctx.fillRect(node.x - campSize / 2, node.y - campSize / 2, campSize, campSize);
      if (drawCampNum) {
        ctx.fillStyle = 'white';
        ctx.fillText((i+1), node.x-3, node.y+4);
        ctx.fillStyle = '#0000CC';
      }
      var stats = get_camp_stats();
      drawStats(ctx, {x: node.x, y: node.y }, stats);
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
      if (drawGenNum) {
        ctx.fillStyle = 'Black';
        ctx.fillText((i+1), node.x+15, node.y+15);
        ctx.fillStyle = circleColor;
      }
    });
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

    // // Add event listener for `click` events.
    // canvas.addEventListener('click', function(event) {
    //   var x = event.pageX,
    //       y = event.pageY;
    //   alert ("clicked at {x:" + x + ", y:" + y + "}")
    // }, false);

    // list of all the images we need to load
    var sources = {
      food: '/food.png',
      admin: '/admin.png',
      health: '/health.png',
      house: '/house.png'
    };

    loadImages(sources, function(loadedImages) {
      images = loadedImages;
      setImgLoaded(true);
      draw(ctx);
    });

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
