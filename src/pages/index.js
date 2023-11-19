"use client";
import React, { useState, useRef, useEffect } from "react";
import "./global.css";
import "./main-page.css";
import Head from "next/head";
import useSWR from "swr";
import io from "socket.io-client";
import { getCampCapacity } from "../lib/utility";
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
  for (var src in sources) {
    numImages++;
  }
  for (var src in sources) {
    newImages[src] = new Image();
    newImages[src].onload = function () {
      if (++loadedImages >= numImages) {
        callback(newImages);
      }
    };
    newImages[src].src = sources[src];
  }
}

export default function Main(props) {
  const [selectedRegionName, setselectedRegionName] = useState(null);
  const [selectedCampStats, setSelectedCampStats] = useState(null);
  const selectedCampStatsRef = useRef(null);

  const [selectedGenName, setSelectedGenName] = useState(null);
  const [selectedGenStats, setSelectedGenStats] = useState(null);
  const selectedGenStatsRef = useRef(null);
  const [activeTab, setActiveTab] = useState("camps");

  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const canvasRef = useRef(null);
  const defaultSize = 720;

  // DEBUGGING ///////////
  var drawCampNum = false,
    drawGenNum = false,
    drawPathNum = false;
  ///////////////////////
  const genRadius = 9;
  const campSize = 26; // size of blue square
  const campDangerSize = 35; // size of red box around the blue square
  const [imgLoaded, setImgLoaded] = useState(false);
  const imagesRef = useRef(null);

  // constants for stats box drawing
  const statsInset = 1;
  const statsIconSize = 20;
  const statsYSpacing = 3;
  const statsMargin = { x: 4, y: 4 };
  // constants for camp stats box drawing
  const campStatsHeight =
    statsIconSize * 5 + statsMargin.y * 2 + statsYSpacing * 4;
  const campStatsWidth = statsIconSize + 35;
  const campStatsBGColor = "#ebebfc"; //'#d9daff';
  // constants for gen stats box drawing
  const genStatsWidth = statsIconSize + 45;
  const genStatsTopHeight = 17;
  const genStatsBottomHeight =
    statsIconSize * 3 + statsMargin.y * 2 + statsYSpacing * 2;
  const genStatsHeight = genStatsTopHeight + genStatsBottomHeight;

  const genStatsBGColor = "#ffe8ef"; // "#efefef";'

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // Function to toggle the panel's open/close state
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };
  const dataRef = useRef(null);
  const { data, error } = useSWR("/map-nodes.json", fetcher);
  const [campStats, setCampStats] = useState(null);
  const campStatsRef = useRef(null);
  const [routeStats, setRouteStats] = useState(null);
  const [genStats, setGenStats] = useState(null);
  const genStatsRef = useRef(null);

  if (error) {
    console.log("error loading json");
  }
  if (!data) console.log("loading map data...");

  function drawCampStats(ctx, position, stats) {
    const imagePos = {
      x: position.x + statsMargin.x,
      y: position.y + statsMargin.y,
    };
    const textPos = {
      x: position.x + statsMargin.x + statsIconSize + 5,
      y: position.y + statsMargin.y + statsIconSize / 2 + 4,
    };

    ctx.fillStyle = "black";
    ctx.fillRect(position.x, position.y, campStatsWidth, campStatsHeight);
    //ctx.fillStyle = "#efefef";
    ctx.fillStyle = campStatsBGColor;
    ctx.fillRect(
      position.x + statsInset,
      position.y + statsInset,
      campStatsWidth - statsInset * 2,
      campStatsHeight - statsInset * 2
    );

    // drawing icons
    if (imagesRef.current != null) {
      const imgArray = [
        imagesRef.current.refugee,
        imagesRef.current.food,
        imagesRef.current.health,
        imagesRef.current.house,
        imagesRef.current.admin,
      ];
      imgArray.forEach((img) => {
        ctx.drawImage(
          img,
          imagePos.x,
          imagePos.y,
          statsIconSize,
          statsIconSize
        );
        imagePos.y += statsIconSize + statsYSpacing;
      });
    }

    // drawing stats text
    ctx.font = "12px serif";
    ctx.fillStyle = "black";
    const statsArray = [
      stats.refugeesPresent,
      stats.food,
      stats.healthcare,
      stats.housing,
      stats.admin,
    ];
    statsArray.forEach((stat) => {
      ctx.fillText(stat, textPos.x, textPos.y);
      textPos.y += statsIconSize + statsYSpacing;
    });
  }

  function drawGenStats(ctx, position, stats) {
    // draw upper box
    ctx.fillStyle = "black";
    ctx.fillRect(position.x, position.y, genStatsWidth, genStatsTopHeight);
    ctx.fillStyle = genStatsBGColor;
    ctx.fillRect(
      position.x + statsInset,
      position.y + statsInset,
      genStatsWidth - statsInset * 2,
      genStatsTopHeight - statsInset * 2
    );

    ctx.font = "11px serif";
    ctx.fillStyle = "black";
    const refugeesText = stats.totalRefugees + " (+" + stats.newRefugees + ")";
    const refugeesTextPos = {
      x:
        position.x +
        genStatsWidth / 2 -
        ctx.measureText(refugeesText).width / 2,
      y: position.y + 12,
    };

    ctx.fillText(refugeesText, refugeesTextPos.x, refugeesTextPos.y);

    const bottomBoxPos = {
      x: position.x,
      y: position.y + genStatsTopHeight - statsInset,
    };
    const imagePos = {
      x: bottomBoxPos.x + statsMargin.x,
      y: bottomBoxPos.y + statsMargin.y,
    };
    const textPos = {
      x: bottomBoxPos.x + statsMargin.x + statsIconSize + 5,
      y: bottomBoxPos.y + statsMargin.y + statsIconSize / 2 + 4,
    };
    ctx.fillStyle = "black";
    ctx.fillRect(
      bottomBoxPos.x,
      bottomBoxPos.y,
      genStatsWidth,
      genStatsBottomHeight
    );
    ctx.fillStyle = genStatsBGColor;
    ctx.fillRect(
      bottomBoxPos.x + statsInset,
      bottomBoxPos.y + statsInset,
      genStatsWidth - statsInset * 2,
      genStatsBottomHeight - statsInset * 2
    );

    // drawing icons
    if (imagesRef.current != null) {
      const imgArray = [
        imagesRef.current.food,
        imagesRef.current.health,
        imagesRef.current.admin,
      ];
      imgArray.forEach((img) => {
        ctx.drawImage(
          img,
          imagePos.x,
          imagePos.y,
          statsIconSize,
          statsIconSize
        );
        imagePos.y += statsIconSize + statsYSpacing;
      });
    }

    // drawing stats text
    ctx.font = "12px serif";
    ctx.fillStyle = "black";
    const statsArray = [stats.food, stats.healthcare, stats.admin];
    statsArray.forEach((stat) => {
      ctx.fillText(stat, textPos.x, textPos.y);
      textPos.y += statsIconSize + statsYSpacing;
    });
  }

  function draw(ctx, campStats, genStats, routeStats) {
    // are the stats and map json loaded yet?
    if (!data || !campStats || !routeStats || !genStats) {
      return;
    }

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.font = "12px serif";

    // Drawing paths (do this first so nodes are rendered on top)
    ctx.lineWidth = 5;

    ctx.beginPath();
    Object.keys(data["paths"]).map((path, i) => {
      ctx.strokeStyle = "#e8bd20";

      const node = data["paths"][path];
      const startNode = data["paths"][path].start;
      const endNode = data["paths"][path].end;
      var startCoord = { x: 0, y: 0 };
      var endCoord = { x: 0, y: 0 };

      // get the x and y of the camp or gen point
      // start node is camp
      if (startNode.type === "camp") {
        startCoord.x =
          data["regions"][startNode.region]["camps"][startNode.node].x;
        startCoord.y =
          data["regions"][startNode.region]["camps"][startNode.node].y;
      }
      // start node is generation point
      else if (startNode.type === "gen") {
        startCoord.x =
          data["regions"][startNode.region]["gens"][startNode.node].x;
        startCoord.y =
          data["regions"][startNode.region]["gens"][startNode.node].y;
      }
      // end node is camp
      if (endNode.type === "camp") {
        endCoord.x = data["regions"][endNode.region]["camps"][endNode.node].x;
        endCoord.y = data["regions"][endNode.region]["camps"][endNode.node].y;
      }
      // end node is generation point
      else if (endNode.type === "gen") {
        endCoord.x = data["regions"][endNode.region]["gens"][endNode.node].x;
        endCoord.y = data["regions"][endNode.region]["gens"][endNode.node].y;
      }
      var isOpen = true;
      // check if we have data from the database for this path
      if (path in routeStats) {
        // is it open?
        if (!routeStats[path].isOpen) {
          isOpen = false;
          ctx.strokeStyle = "red";
        }
      }

      // ready to draw
      ctx.beginPath();
      ctx.moveTo(startCoord.x, startCoord.y);
      // if control points exist, draw a bezier (curved) line
      if (
        data["paths"][path]["cp1"] != null &&
        data["paths"][path]["cp2"] != null
      ) {
        const cp1 = data["paths"][path]["cp1"];
        const cp2 = data["paths"][path]["cp2"];
        ctx.bezierCurveTo(
          startCoord.x + cp1.x,
          startCoord.y + cp1.y,
          endCoord.x + cp2.x,
          endCoord.y + cp2.y,
          endCoord.x,
          endCoord.y
        );
        ctx.stroke(); // Render the path
      } // no control points, straight line from a to b
      else {
        ctx.lineTo(endCoord.x, endCoord.y);
        ctx.stroke(); // Render the path
      }

      // draw the supply cap number
      if (isOpen && "supplyCapOffset" in data["paths"][path]) {
        ctx.fillStyle = "blue";
        const supOffset = data["paths"][path].supplyCapOffset;
        // add drawing offset from the start of the path
        ctx.fillText(
          routeStats[path].supplyCap.toString() + " sup",
          (startCoord.x + endCoord.x) / 2 + supOffset.x,
          (startCoord.y + endCoord.y) / 2 + supOffset.y
        );
      }

      // for debugging
      if (drawPathNum) {
        ctx.fillStyle = "black";
        ctx.font = "12px serif";
        ctx.fillText(
          i + 1,
          (startCoord.x + endCoord.x) / 2,
          (startCoord.y + endCoord.y) / 2
        );
      }
    });

    // loop through regions
    Object.keys(data["regions"]).map((regionNum) => {
      const region = data["regions"][regionNum];
      // how much to offset the inner part of the square
      const bevelOffset = Math.ceil(campSize * 0.1); // 10%
      // how much to offset the outer part of the square (danger indicator)
      const dangerOffset = Math.ceil(campSize * 0.1); // 25%
      // Drawing camps (blue squares)
      if ("camps" in region) {
        // get camp capacity based on the stats
        const campCapacity = getCampCapacity(
          campStats[regionNum].food,
          campStats[regionNum].healthcare,
          campStats[regionNum].housing,
          campStats[regionNum].admin
        );
        // loop through all the camps in the region
        Object.keys(region["camps"]).map((camp) => {
          const campNode = region["camps"][camp];

          // is this camp in danger?
          if (campCapacity < campStats[regionNum].refugeesPresent) {
            // draw a red box around the blue square
            ctx.fillStyle = "red";
            ctx.fillRect(
              campNode.x - campSize / 2 - dangerOffset,
              campNode.y - campSize / 2 - dangerOffset,
              campSize + dangerOffset * 2,
              campSize + dangerOffset * 2
            );
          }
          // draw outer square
          ctx.fillStyle = "#2e35c0"; // blue
          ctx.fillRect(
            campNode.x - campSize / 2,
            campNode.y - campSize / 2,
            campSize,
            campSize
          );
          // draw inner square
          ctx.fillStyle = "#3c66ba"; // light blue
          ctx.fillRect(
            campNode.x - campSize / 2 + bevelOffset,
            campNode.y - campSize / 2 + bevelOffset,
            campSize - bevelOffset * 2,
            campSize - bevelOffset * 2
          );

          // if (drawCampNum) {
          //   ctx.fillStyle = 'white';
          //   ctx.font = "12px serif";
          //   ctx.fillText(camp, campNode.x-3, campNode.y+4);
          //   ctx.fillStyle = '#0000CC';
          // }
          // draw capacity on the camp

          ctx.fillStyle = "white";
          ctx.font = "12px serif";
          const textWidth = ctx.measureText(campCapacity).width;
          ctx.fillText(
            campCapacity,
            campNode.x - textWidth / 2,
            campNode.y + 4
          );
          ctx.fillStyle = "#0000CC";
        });
      }

      // Drawing generation points (red circles)
      if ("gens" in region) {
        const circleColor = "#FF0000";
        Object.keys(region["gens"]).map((gen_point) => {
          const genNode = region["gens"][gen_point];

          // get stats for this region from campStats
          // camp stats should have data from the database about each region
          var stats = genStats[gen_point];
          const statsPostion = genNode.statsPos;

          // draw a line connecting the gen point and stats box
          ctx.beginPath();
          ctx.strokeStyle = "red";
          ctx.lineWidth = 1;
          ctx.moveTo(genNode.x, genNode.y);
          ctx.lineTo(statsPostion.x + 35, statsPostion.y + 45);
          ctx.stroke();

          // multiplied by circle size to get outer circle size
          const outerCircleRatio = 1.4;

          // outer outline box
          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.arc(
            genNode.x,
            genNode.y,
            genRadius * outerCircleRatio + 1,
            0,
            2 * Math.PI
          );
          ctx.fill();

          switch (stats.genType) {
            case "ORDERLY":
              ctx.fillStyle = "green";
              break;
            case "DISORDERLY":
              ctx.fillStyle = "yellow";
              break;
            case "PANIC":
              ctx.fillStyle = "#9C0000";
              break;
            default:
              ctx.fillStyle = "green";
          }

          // draw outer circle (color indicating generation type)
          ctx.beginPath();
          ctx.arc(
            genNode.x,
            genNode.y,
            genRadius * outerCircleRatio,
            0,
            2 * Math.PI
          );
          ctx.fill();

          // inner outline box
          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.arc(genNode.x, genNode.y, genRadius + 1, 0, 2 * Math.PI);
          ctx.fill();

          // draw inner red circle
          ctx.beginPath();
          ctx.arc(genNode.x, genNode.y, genRadius, 0, 2 * Math.PI);
          ctx.fillStyle = circleColor;
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "12px serif";
          const textWidth = ctx.measureText(genNode.letter).width;
          ctx.fillText(
            genNode.letter,
            genNode.x - textWidth / 2,
            genNode.y + 4
          );
          ctx.fillStyle = circleColor;

          drawGenStats(ctx, statsPostion, stats);

          if (drawGenNum) {
            ctx.fillStyle = "Black";
            ctx.fillText(gen_point, genNode.x + 15, genNode.y + 15);
            ctx.fillStyle = circleColor;
          }
        });
      }
      // draw region label
      if ("labelPos" in region) {
        ctx.font = "16px serif";
        ctx.fillStyle = "green";
        ctx.fillText(regionNum, region["labelPos"].x, region["labelPos"].y);
        ctx.fillStyle = "#0000CC";
      }
      // camp stats
      if (
        "campsStatsPos" in region &&
        campStats &&
        campStats[regionNum] != null
      ) {
        // get stats for this region from campStats
        // camp stats should have data from the database about each region
        var stats = campStats[regionNum];
        const statsPostion = region["campsStatsPos"];
        drawCampStats(ctx, statsPostion, stats);
      }
    });
  }

  function handleInput(clickLoc, data, scale) {}

  // initial useEffect function, will be called on page load
  useEffect(() => {
    console.log("use effect called");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    window.addEventListener("resize", resizeCanvas, false);
    function resizeCanvas() {
      const pixelRatio = 1; // window.devicePixelRatio || 1;
      var size = defaultSize;
      // handle resizing if panel is open
      if (isPanelOpen && window.innerWidth - 300 < window.innerHeight) {
        size = window.innerWidth - 300;
        canvas.width = size;
        canvas.height = size;
      } else {
        if (window.innerWidth < window.innerHeight) {
          size = window.innerWidth;
          canvas.width = size;
          canvas.height = size;
        } else {
          size = window.innerHeight;
          canvas.width = size;
          canvas.height = size;
        }
      }
      ctx.scale(size / defaultSize, size / defaultSize);
      draw(ctx, campStats, genStats, routeStats);
    }
    
    // list of all the images we need to load
    var sources = {
      refugee: "/refugee.png",
      food: "/food.png",
      admin: "/admin.png",
      health: "/health.png",
      house: "/house.png",
    };

    loadImages(sources, function (loadedImages) {
      imagesRef.current = loadedImages;
      setImgLoaded(true);
      draw(ctx, campStats, genStats, routeStats);
    });

    resizeCanvas();
  }, [data, campStats]);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        if (minutes === 0 && seconds === 0) {
          clearInterval(interval);
          setIsActive(false);
        } else {
          if (seconds === 0) {
            setMinutes((prevMinutes) => prevMinutes - 1);
            setSeconds(59);
          } else {
            setSeconds((prevSeconds) => prevSeconds - 1);
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleToggle = () => {
    if (!isActive) {
      // Start the timer with the user-specified time
      // For simplicity, let's assume the user input is in seconds
      const totalSeconds = minutes * 60 + seconds;
      setMinutes(Math.floor(totalSeconds / 60));
      setSeconds(totalSeconds % 60);
    }

    setIsActive(!isActive);
  };

  // effect for initializing socket. empty dependancy array to make it run only once
  useEffect(() => {
    const socketInitializer = async () => {
      await fetch("/api/server");
      socket = io();

      socket.on("connect", () => {
        console.log("connected");
      });

      socket.on("camp_stats", (stats) => {
        console.log("Received camp stats on client: ");
        console.log(stats);
        setCampStats(stats);
        //if (selectedCampStats == null) {
          setSelectedCampStats(Object.values(stats)[0]);
          setselectedRegionName(Object.keys(stats)[0]);
        //}
        //else {
          //setSelectedCampStats(selectedCampStats[selectedRegionName]);
        //}
      });

      socket.on("routes", (routes) => {
        console.log("Received routes on client: ");
        console.log(routes);
        setRouteStats(routes);
      });
      socket.on("gens", (gens) => {
        console.log("Received gen points on client: ");
        console.log(gens);
        setGenStats(gens);
        //if (selectedGenStats == null) {
          setSelectedGenStats(Object.values(gens)[0]);
          setSelectedGenName(Object.keys(gens)[0]);
        //}
        //else {
          //setSelectedGenStats(selectedGenStats[selectedGenName]);
          //console.log("called")
        //}
      });

      // socket.on("campResult", (result) => {
      //   console.log("Received camp:");
      //   console.log(result);
      //   setIndCampStats(result);

      //   // Handle the result as needed
      // });

      socket.on("campsStatsUpdated", (updatedData) => {
        console.log("Camp stats updated:", updatedData);
      });
    };

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
      //selectedCampStatsRef.current = campStats;
      //selectedGenStatsRef.current = genStats;
      campStatsRef.current = campStats;
      genStatsRef.current = genStats;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      // Add event listener for `click` events.
      canvas.addEventListener(
        "click",
        function (event) {

          if (campStatsRef.current == null || genStatsRef == null) {
            return;
          }
          // get click position relative to scale of canvas
          const scale = defaultSize / canvas.height;
          const canvasX = Math.floor(event.offsetX * scale);
          const canvasY = Math.floor(event.offsetY * scale);
          var clickLoc = { x: canvasX, y: canvasY };
          const data = dataRef.current;
          //handleInput(clickLoc, data, scale)
          if (!data) return;
          const campClickTarget = campSize / 2;

          console.log(JSON.stringify(clickLoc));
          Object.keys(data["regions"]).map((regionName) => {
            const region = data["regions"][regionName];
            if ("gens" in region) {
              // clicking on gen points
              Object.keys(region["gens"]).map((genName) => {
                const gen = region["gens"][genName];
                var radius = genRadius * 1.4;
                if (
                  (clickLoc.x < gen.x + radius && // gen node click
                  clickLoc.x > gen.x - radius &&
                  clickLoc.y < gen.y + radius &&
                  clickLoc.y > gen.y - radius) || 
                  (clickLoc.x > gen['statsPos'].x && // gen stats click
                  clickLoc.x < gen['statsPos'].x + genStatsWidth &&
                  clickLoc.y > gen['statsPos'].y && 
                  clickLoc.y < gen['statsPos'].y + genStatsHeight)
                ) {
                  console.log("clicked on gen " + genName);
                  setActiveTab("refugeeGeneration");
                  setIsPanelOpen(true);
                  
                  setSelectedGenName(genName);
                  setSelectedGenStats(genStatsRef.current[genName]);
                }
              });
            }
            if ("camps" in region) {
              // clicking on camp stats
              if (
                clickLoc.x > region["campsStatsPos"].x &&
                clickLoc.x < region["campsStatsPos"].x + campStatsWidth &&
                clickLoc.y > region["campsStatsPos"].y &&
                clickLoc.y < region["campsStatsPos"].y + campStatsHeight
              ) {
                console.log("clicked on region " + regionName);
                setselectedRegionName(regionName);
                setSelectedCampStats(campStatsRef.current[regionName]);
                console.log(campStatsRef.current[regionName]);
                setActiveTab("camps");
                setIsPanelOpen(true);
              }
              Object.keys(region["camps"]).map((campName) => {
                // clicking on camp nodes
                var node = region["camps"][campName];
                if (
                  clickLoc.x < node.x + campClickTarget &&
                  clickLoc.x > node.x - campClickTarget &&
                  clickLoc.y < node.y + campClickTarget &&
                  clickLoc.y > node.y - campClickTarget
                ) {
                  console.log("clicked on camp " + campName);
                  setselectedRegionName(regionName);
                  setSelectedCampStats(campStatsRef.current[regionName]);
                  console.log(campStatsRef.current[regionName]);
                  setActiveTab("camps");
                  setIsPanelOpen(true);
                  
                }
              });
            }
          });
        },
        false
      );
      draw(ctx, campStats, genStats, routeStats);
    }
  }, [data, campStats,genStats,routeStats]);

  const sendCampUpdate = () => {
    const updateData = {
      refugeesPresent: selectedCampStats.refugeesPresent,
      food: selectedCampStats.food,
      healthcare: selectedCampStats.healthcare,
      housing: selectedCampStats.housing,
      admin: selectedCampStats.admin,
    };

    socket.emit("updateCampStats", selectedCampStats, selectedRegionName);
    console.log("Update was sent");
    console.log(updateData);
  };

  const sendGenUpdate = () => {
    const updateData = {
      food: selectedGenStats.food,
      healthcare: selectedGenStats.healthcare,
      admin: selectedGenStats.admin,
      genType:selectedGenStats.genType,
      totalRefugees:selectedGenStats.totalRefugees,
      newRefugees:selectedGenStats.newRefugees,
    };

    socket.emit("updateGenStats", selectedGenStats, selectedGenName);
    console.log("Update was sent");
    console.log(updateData);
  };

  

  const sendPathUpdate = () => {

  }

  return (
    <div>
      
      <div className={`canvas-container ${isPanelOpen ? "sidebar" : ""}`}>
        {/* Add a background image as a CSS background */}

        <div className="canvas-background" />
        <canvas
          data-testid="canvas"
          ref={canvasRef}
          width={defaultSize}
          height={defaultSize}
        />
      </div>

      {/* Side Panel */}
      {campStats && genStats && routeStats &&(
      <div className={`side-panel ${isPanelOpen ? "open" : ""}`}>
        {/* Panel content goes here, include drop down */}

        <div className="side-panel-header">
          <button
            className={`tab-button ${activeTab === "camps" ? "active" : ""}`}
            onClick={() => setActiveTab("camps")}
          >
            Camps
          </button>
          <button
            className={`tab-button ${
              activeTab === "refugeeGeneration" ? "active" : ""
            }`}
            onClick={() => setActiveTab("refugeeGeneration")}
          >
            Refugee Generation
          </button>
          <button
            className={`tab-button ${activeTab === "paths" ? "active" : ""}`}
            onClick={() => setActiveTab("paths")}
          >
            Paths
          </button>
          
        </div>
        
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          
          {/* Content for "Camps" tab */}
          {activeTab === "camps" && (
            <div>
              {campStats && (
                <div>
                  <label htmlFor="dropdown">Region</label>
                  <select
                    id="dropdown"
                    value={selectedRegionName}
                    onChange={(event) => {
                      setselectedRegionName(event.target.value);
                      setSelectedCampStats(campStats[event.target.value]);
                    }}
                  >
                    <option value="1">Region 1</option>
                    <option value="4">Region 4</option>
                    <option value="6">Region 6</option>
                    <option value="7">Region 7</option>
                    <option value="8">Region 8</option>
                    <option value="11">Region 11</option>
                  </select>
                  <br />
                  <br />
                  <label htmlFor="fname">Refugees: </label>
                  <input
                    type="number"
                    placeholder="Enter refugee number.."
                    value={selectedCampStats.refugeesPresent}
                    onChange={(event) => {
                      setSelectedCampStats((prevStats) => ({
                        ...prevStats,
                        refugeesPresent: event.target.value,
                      }));
                    }}
                  />
                  <br />
                  <br />
                  <label htmlFor="fname">Food: </label>
                  <input
                    type="number"
                    placeholder="Enter food level.."
                    value={selectedCampStats.food}
                    onChange={(event) => {
                      setSelectedCampStats((prevStats) => ({
                        ...prevStats,
                        food: event.target.value,
                      }));
                    }}
                  />
                  <br />
                  <br />
                  <label htmlFor="fname">Health: </label>
                  <input
                    type="number"
                    placeholder="Enter health level.."
                    value={selectedCampStats.healthcare}
                    onChange={(event) => {
                      setSelectedCampStats((prevStats) => ({
                        ...prevStats,
                        healthcare: event.target.value,
                      }));
                    }}
                  />
                  <br />
                  <br />
                  <label htmlFor="fname">Housing: </label>
                  <input
                    type="number"
                    placeholder="Enter housing level.."
                    value={selectedCampStats.housing}
                    onChange={(event) => {
                      setSelectedCampStats((prevStats) => ({
                        ...prevStats,
                        housing: event.target.value,
                      }));
                    }}
                  />
                  <br />
                  <br />
                  <label htmlFor="fname">Admin: </label>
                  <input
                    type="number"
                    placeholder="Enter admin level.."
                    value={selectedCampStats.admin}
                    onChange={(event) => {
                      setSelectedCampStats((prevStats) => ({
                        ...prevStats,
                        admin: event.target.value,
                      }));
                    }}
                  />
                </div>
              )}
              <br />

              <button className="borderedd-button-update" onClick={sendCampUpdate}>
                Update
              </button>
              <button className="borderedd-button-revert" onClick={()=> setSelectedCampStats(campStats[selectedRegionName])} >
                Revert
              </button>
              <button className="borderedd-button-timer" onClick={handleToggle}>
                Start Timer</button>
              {isActive && (
                <div>
                  <p><center>
                  Time Remaining: {String(minutes).padStart(2, '0')}:
                  {String(seconds).padStart(2, '0')}
                  </center></p>
                </div>
              )}
              {isActive || (
                <div>
                <label>
                 Minutes:
                <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                />
                </label>
                <label>
                Seconds:
                <input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value, 10))}
              />
              </label>
            </div>
            )}    
          </div>
        )}

<div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Content for "Refugee Gen" tab */}
          {activeTab === "refugeeGeneration" && (
            <div>
              { genStats && (
                <div>
              
                <label htmlFor="dropdown">Generation point</label>
                <select
                  id="dropdown"
                  value={selectedGenName}
                  onChange={(event) => {
                    setSelectedGenName(event.target.value);
                    setSelectedGenStats(genStats[event.target.value]);
                  }}
                >
                  <option value="1">Gen 1</option>
                  <option value="2">Gen 2</option>
                  <option value="3">Gen 3</option>
                  <option value="4">Gen 4</option>
                  <option value="5">Gen 5</option>
                  <option value="6">Gen 6</option>
                </select>
                <br />
                <br />
                <label htmlFor="fname">Total Refugees: </label>
                <input
                  type="number"
                  placeholder="Enter Refugees.."
                  value={selectedGenStats.totalRefugees}
                  onChange={(event) => {
                    setSelectedGenStats((prevStats) => ({
                      ...prevStats,
                      totalRefugees: event.target.value,
                    }));
                  }}
                />
                <br />
                <br />  
                <label htmlFor="fname">New Refugees: </label>
                <input
                  type="number"
                  placeholder="Enter new refugees.."
                  value={selectedGenStats.newRefugees}
                  onChange={(event) => {
                    setSelectedGenStats((prevStats) => ({
                      ...prevStats,
                      newRefugees: event.target.value,
                    }));
                  }}
                />
                <br />
                <br />
                <label htmlFor="fname">Food: </label>
                <input
                  type="number"
                  placeholder="Enter food level.."
                  value={selectedGenStats.food}
                  onChange={(event) => {
                    setSelectedGenStats((prevStats) => ({
                      ...prevStats,
                      food: event.target.value,
                    }));
                  }}
                />
                <br />
                <br />
                
                <label htmlFor="fname">Health: </label>
                <input
                  type="number"
                  placeholder="Enter health level.."
                  value={selectedGenStats.healthcare}
                  onChange={(event) => {
                    setSelectedGenStats((prevStats) => ({
                      ...prevStats,
                      healthcare: event.target.value,
                    }));
                  }}
                />
                <br />
                <br />
                <label htmlFor="fname">Admin: </label>
                <input
                  type="number"
                  placeholder="Enter admin level.."
                  value={selectedGenStats.admin}
                  onChange={(event) => {
                    setSelectedGenStats((prevStats) => ({
                      ...prevStats,
                      admin: event.target.value,
                    }));
                  }}
                />
                <label htmlFor="dropdown">Generation Type</label>
                <select
                  id="dropdown"
                  value={selectedGenStats.genType}
                  onChange={(event) => {
                    setSelectedGenStats((prevStats) => ({
                      ...prevStats,
                      genType: event.target.value,
                    }));
                  }}
                >
                  <option value="ORDERLY">ORDERLY</option>
                  <option value="DISORDERLY">DISORDERLY</option>
                  <option value="PANIC">PANIC</option>
                </select>
                
              <br />
              <br />
              <button className="borderedd-button-update" onClick={sendGenUpdate}>
                Update
              </button>
              <button className="borderedd-button-revert" onClick={()=> setSelectedGenStats(genStats[selectedGenName])} >
                Revert
              </button>
            </div>
              )}
            </div>
          )}

          {/* Content for "Paths" tab */}
          {activeTab === "paths" && (
            <div>
              <div>
                <button className="borderedd-button-update" onClick={sendPathUpdate}>
                  Update
                </button>
                <button className="borderedd-button-revert" >
                  Revert
                </button>
              </div>
            </div>
          )}

          <button
            className="bordered-button-togglepanel"
            onClick={togglePanel}
            style={{ position: "fixed", bottom: 0, right: 0 }}
          >
            Toggle Panel
          </button>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}