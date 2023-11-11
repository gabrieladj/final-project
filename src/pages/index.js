"use client"
import React, { useState, useRef, useEffect } from 'react';
import styles from './globals.css';
import Head from 'next/head';
import useSWR from 'swr'
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
  const [campStats, setCampStats] = useState(null);
  const [routeStats, setRouteStats] = useState(null);


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
    ctx.font = "12px serif";
    ctx.fillText(stats.food, textPos.x, textPos.y);
    textPos.y += imgSize;
    ctx.fillText(stats.housing, textPos.x, textPos.y);
    textPos.y += imgSize;
    ctx.fillText(stats.healthcare, textPos.x, textPos.y);
    textPos.y += imgSize;
    ctx.fillText(stats.admin, textPos.x, textPos.y);
  }

  function draw(ctx, campStats) {
    // if the data object loaded?
    if (!data) { return; }
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.font = "12px serif";

    // Drawing paths (do this first so nodes are rendered on top)
    ctx.lineWidth = 5;
    
    ctx.beginPath();
    Object.keys(data['paths']).map((path, i) => {
      ctx.strokeStyle = '#e8bd20';
      // check if we have data from the database for this path
      if (routeStats != null && path in routeStats) {
        if (!routeStats[path].isOpen) {
          ctx.strokeStyle = 'red';
        }
      }

      const node = data['paths'][path];
      const startNode = data['paths'][path].start;
      const endNode = data['paths'][path].end;
      var startCoord = {x: 0, y: 0};
      var endCoord = {x: 0, y: 0};
      
      // get the x and y of the camp or gen point
      // start node is camp
      if (startNode.type === "camp") {
        startCoord.x = data['regions'][startNode.region]['camps'][startNode.node].x;
        startCoord.y = data['regions'][startNode.region]['camps'][startNode.node].y;
      }
      // start node is generation point
      else if (startNode.type === "gen") {
        startCoord.x = data['regions'][startNode.region]['gens'][startNode.node].x;
        startCoord.y = data['regions'][startNode.region]['gens'][startNode.node].y;
      }
      // end node is camp
      if (endNode.type === "camp") {
        endCoord.x = data['regions'][endNode.region]['camps'][endNode.node].x;
        endCoord.y = data['regions'][endNode.region]['camps'][endNode.node].y;
      }
      // end node is generation point
      else if (endNode.type === "gen") {
        endCoord.x = data['regions'][endNode.region]['gens'][endNode.node].x;
        endCoord.y = data['regions'][endNode.region]['gens'][endNode.node].y;
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
        ctx.font = "12px serif";
        ctx.fillText((i+1), (startCoord.x+endCoord.x)/2, (startCoord.y+endCoord.y)/2);
      }
    });

    // loop through regions
    Object.keys(data['regions']).map((regionNum, i) => {
      ctx.fillStyle = '#0000CC';
      const region = data['regions'][regionNum];
      // Drawing camps (blue squares)
      if ('camps' in region) {
        Object.keys(region['camps']).map((camp, j) => {
          const campNode = region['camps'][camp];
          ctx.fillRect(campNode.x - campSize / 2, campNode.y - campSize / 2, campSize, campSize);
          // if (drawCampNum) {
          //   ctx.fillStyle = 'white';
          //   ctx.font = "12px serif";
          //   ctx.fillText(camp, campNode.x-3, campNode.y+4);
          //   ctx.fillStyle = '#0000CC';
          // }
          // draw number of refugees on camp
          if (campStats && campStats[regionNum] != null) {
              const refugueesPresent = campStats[regionNum].refugueesPresent;
              ctx.fillStyle = 'white';
              ctx.font = "12px serif";
              ctx.fillText(refugueesPresent, campNode.x-3, campNode.y+4);
              ctx.fillStyle = '#0000CC';
          }
        });
      }

      // Drawing generation points (red circles)
      if ('gens' in region) {
        const circleColor = '#FF0000';
        Object.keys(region['gens']).map((gen_point, i) => {
          const genNode = region['gens'][gen_point];
          ctx.beginPath();
          ctx.arc(genNode.x, genNode.y, genRadius, 0, 2 * Math.PI);
          ctx.fillStyle = circleColor;
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = "12px serif";
          ctx.fillText(genNode.letter, genNode.x-4, genNode.y+4);
          ctx.fillStyle = circleColor;
          if (drawGenNum) {
            ctx.fillStyle = 'Black';
            ctx.fillText((i+1), genNode.x+15, genNode.y+15);
            ctx.fillStyle = circleColor;
          }
        });
      }
      // draw region label (refugees present)
      if ('labelPos' in region) { 
        ctx.font = "16px serif"; 
        ctx.fillStyle = 'green';
        ctx.fillText(regionNum, region['labelPos'].x, region['labelPos'].y);
        ctx.fillStyle = '#0000CC';
      }
      // camp stats
      if ('campsStatsPos' in region && campStats 
          && campStats[regionNum] != null)
      { 
        // get stats for this region from campStats
        // camp stats should have data from the database about each region
        var stats = campStats[regionNum];
        const statsPostion =  region['campsStatsPos'];
        drawStats(ctx, statsPostion, stats);
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
      draw(ctx, campStats);
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
      draw(ctx, campStats);
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
      });
  
      socket.on('receive_message',(data) => {
        setMessageRecieve(data.message)
        alert(data.message)
        console.log("message was sent")
      });

      socket.on('camp_stats',(stats) => {
        console.log('Received camp stats on client: ');
        console.log(stats);
        setCampStats (stats);
      });

      socket.on('routes',(routes) => {
        console.log('Received routes on client: ');
        console.log(routes);
        setRouteStats(routes)
      });
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
        Object.keys(data['regions']).map((regionName) => {
          const region = data['regions'][regionName];
          if ('camps' in region) {
            Object.keys(region['camps']).map((campName) => {
              var node = region['camps'][campName];
              
              if (clickLoc.x < node.x + campClickTarget && clickLoc.x > node.x - campClickTarget
                  && clickLoc.y < node.y + campClickTarget && clickLoc.y > node.y - campClickTarget) {
                console.log ("clicked on camp " + (campName));
              }
            });
          }
        });
      }, false);
      draw(ctx, campStats);
    }
  }, [data, campStats] );

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
        <label htmlFor="dropdown">Deployable region: </label>
        <select id="dropdown" onChange={(event) => {
              setMessage(event.target.value)
            }}>
          <option value="1">Region 1</option>
          <option value="4">Region 4</option>
          <option value="6">Region 6</option>
          <option value="7">Region 7</option>
          <option value="8">Region 8</option>
          <option value="11">Region 11</option>
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
          <button className ="bordered-button" onClick={sendMessage}>Update</button>
          <h1>{messageRecieve}</h1>

        </div>

        <button className ="bordered-button" onClick={togglePanel}>Toggle Panel</button>
       
      </div>
      
    </div>
  );
}