"use client"
import React, { useState, useRef, useEffect } from 'react';
import styles from './globals.css';
import Head from 'next/head';
import useSWR from 'swr'
import {get_camp_stats} from '../lib/stats'
import io from "socket.io-client"
let socket;

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

function DropdownMenu() {
  return (
    <div>
      <label htmlFor="dropdown">Select an option:</label>
      <select id="dropdown" value={selectedOption} onChange={handleDropdownChange}>
        <option value="option1">Camp 1</option>
        <option value="option2">Camp 2</option>
        <option value="option3">Camp 3</option>
        <option value="option3">Camp 4</option>
        <option value="option3">Camp 5</option>
      </select>
    </div>
  );
}

export default function Main(props) {

  const [message,setMessage] = useState('')
  const [messageRecieve,setMessageRecieve]= useState("")


  const canvasRef = useRef(null);
  const defaultSize = 720;
  var drawCampNum = true,
      drawGenNum = false,
      drawPathNum = false;
  const genRadius = 9;
  const campSize = 25; // size of blue square
  const [imgLoaded, setImgLoaded] = useState(false);
  const imagesRef = useRef(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);


  // Function to toggle the panel's open/close state
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const dataRef = useRef(null)
  const { data, error } = useSWR('/map-nodes.json', fetcher)

  if (error) { 
    console.log("error loading json");
  }
  if (!data) console.log('loading map data...');

  function drawStats(ctx, position, stats) {
    const ySpacing = 21;
    const imgSize = 20;
    const margin   = {'x': 4,
                      'y': 4};
    const imagePos = {'x': position.x+margin.x,
                      'y': position.y+margin.y};
    const textPos  = {'x': position.x + margin.x + imgSize + 5,
                      'y': position.y + margin.y + (imgSize/2) + 5};

    ctx.font = "12px serif";

    ctx.fillStyle = "#E7E0CA";
    ctx.fillRect(position.x, position.y, imgSize+35, (imgSize*4)+margin.y*2);
    
    if (imagesRef.current != null ) {
        ctx.drawImage(imagesRef.current.food, imagePos.x, imagePos.y, imgSize, imgSize);
        imagePos.y += imgSize;
        ctx.drawImage(imagesRef.current.house, imagePos.x, imagePos.y, imgSize, imgSize);
        imagePos.y += imgSize;
        ctx.drawImage(imagesRef.current.health, imagePos.x, imagePos.y, imgSize, imgSize);
        imagePos.y += imgSize;
        ctx.drawImage(imagesRef.current.admin, imagePos.x, imagePos.y, imgSize, imgSize);
    }
    ctx.fillStyle = 'black';
    ctx.fillText(stats.foodLevel, textPos.x, textPos.y);
    textPos.y += imgSize;
    ctx.fillText(stats.housingLevel, textPos.x, textPos.y);
    textPos.y += imgSize;
    ctx.fillText(stats.healthcareLevel, textPos.x, textPos.y);
    textPos.y += imgSize;
    ctx.fillText(stats.administrationLevel, textPos.x, textPos.y);
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
    Object.keys(data['camps']).map((camp, i) => {
      ctx.fillStyle = '#0000CC';
      const node = data['camps'][camp];
      const statsOffset = node['statsOffset'];
      const statsPostion = {"x": node.x + statsOffset.x, "y": node.y + statsOffset.y};
      ctx.fillRect(node.x - campSize / 2, node.y - campSize / 2, campSize, campSize);
      if (drawCampNum) {
        ctx.fillStyle = 'white';
        ctx.fillText((i+1), node.x-3, node.y+4);
        ctx.fillStyle = '#0000CC';
      }
      var stats = get_camp_stats();

      drawStats(ctx, statsPostion, stats);
    });

    // Drawing generation points (red circles)
    const circleColor = '#FF0000';
    Object.keys(data['generation_points']).map((gen_point, i) => {
      const node = data['generation_points'][gen_point];
      ctx.beginPath();
      ctx.arc(node.x, node.y, genRadius, 0, 2 * Math.PI);
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

  function handleInput(clickLoc, data, scale) {
    
  }
  
  // initial useEffect function, will be called on page load
  useEffect(() => {
    console.log("use effect called");
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

    // list of all the images we need to load
    var sources = {
      food: '/food.png',
      admin: '/admin.png',
      health: '/health.png',
      house: '/house.png'
    };

    loadImages(sources, function(loadedImages) {
      imagesRef.current = loadedImages;
      setImgLoaded(true);
      draw(ctx);
    });

    resizeCanvas();
  });

  // effect for initializing socket. empty dependancy array to make it run only once
  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/server');
      socket = io();
  
      socket.on('connect', () => {
        console.log('connected');
      })
  
      socket.on('receive_message',(data) => {
        setMessageRecieve(data.message)
        alert(data.message)
        console.log("message was sent")
      })

      socket.on('camp_stats',(camp) => {
        console.log('Received camp stats on client: ');
        console.log(camp);
      })
    }

    socketInitializer();
    return () => {
      // Add a cleanup function to close the socket connection when the component unmounts
      socket.disconnect();
    };
  }, []);

  // Separate effect for drawing based on changes in 'data'
  useEffect(() => {
    if (data) {
      // Store the data object in the ref
      dataRef.current = data;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Add event listener for `click` events.
      canvas.addEventListener('click', function(event) {
        // get click position relative to scale of canvas
        const scale = defaultSize / canvas.height;
        const canvasX = Math.floor(event.offsetX * scale);
        const canvasY = Math.floor(event.offsetY * scale);
        var clickLoc = {'x': canvasX, 'y': canvasY};
        const data = dataRef.current;
        //handleInput(clickLoc, data, scale)
        if (!data) return;
        const campClickTarget = campSize * scale / 2;
        console.log(JSON.stringify(clickLoc));
        Object.keys(data['camps']).map((camp, i) => {
          var node = data['camps'][camp];
          
          if (clickLoc.x < node.x + campClickTarget && clickLoc.x > node.x - campClickTarget
              && clickLoc.y < node.y + campClickTarget && clickLoc.y > node.y - campClickTarget) {
            console.log ("clicked on camp " + (i+1));
          }
        });
      }, false);
      draw(ctx);
    }
  }, [data] );

  const sendMessage = () =>{
    socket.emit("send_message" , {
      message : message
      
    });
    socket.emit("updateLevelFood",{
      foodLevel : ""
    })
    console.log('sending a message');

    
  }

  

  return (
    <div className="centered-container">
      <div id="canvas-container" className={styles.Canvas2D}>
        {/* Add a background image as a CSS background */}
        <div className="CanvasBackground" />
        <canvas data-testid="canvas" ref={canvasRef} width={defaultSize} height={defaultSize} />
      </div>
      {/* Side Panel */}
      <div className={`side-panel ${isPanelOpen ? 'open' : ''}`}>
        {/* Panel content goes here, include drop down */}
        <label htmlFor="dropdown">Select a camp: </label>
        <select id="dropdown">
        <option value="option1">Camp 1</option>
        <option value="option2">Camp 2</option>
        <option value="option3">Camp 3</option>
        <option value="option2">Camp 4</option>
        <option value="option3">Camp 5</option>
        </select>
        <br></br><br></br>

        <div>
        <label htmlFor="fname">Food: </label>
          <input 
            placeholder='Enter food level..'
            onChange={(event) => {
              setMessage(event.target.value)
            }}
          />
          <br></br><br></br>
          <label htmlFor="fname">Housing: </label>
          <input 
            placeholder='Enter housing level..'
            onChange={(event) => {
              setMessage(event.target.value)
            }}
          />
          <br></br><br></br>
          <label htmlFor="fname">Health: </label>
          <input 
            placeholder='Enter health level..'
            onChange={(event) => {
              setMessage(event.target.value)
            }}
          />
          <br></br><br></br>
          <label htmlFor="fname">Admin: </label>
          <input 
            placeholder='Enter admin level..'
            onChange={(event) => {
              setMessage(event.target.value)
            }}
          />
          <button class ="bordered-button" onClick={sendMessage}>Update</button>
          <h1>{messageRecieve}</h1>

        </div>

        <button class ="bordered-button" onClick={togglePanel}>Toggle Panel</button>
       
      </div>
      
    </div>
  );
}