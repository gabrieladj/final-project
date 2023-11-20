const { Server } = require("socket.io");
import { prisma } from "../../server/db/client";
import { getAllCampStats, getAllRoutes, getAllGens } from "../../lib/stats";
import { Console } from "console";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    var timerStartTime = 0;
    var timerStopTime = 0;

    // if timer is started for 1 minute, will be 60*1000 (milliseconds)
    var timerTotalTime = 0; 
    var timerRunning = false;


    function getTimeRemaining() {
      const now = new Date();
      console.log(timerTotalTime + "  - " + now.getTime() + " - " + timerStartTime);
      return timerTotalTime - (now.getTime() - timerStartTime);
    }

    io.on("connection", async (socket) => {
      console.log(`User connected: ${socket.id}`);

      // client has just connected, get initial stats
      const campStats = await getAllCampStats();
      const routes = await getAllRoutes();
      const gens = await getAllGens();
      // send initial stats to client who connected
      socket.emit("camp_stats", campStats);
      socket.emit("routes", routes);
      socket.emit("gens", gens);

      if (timerRunning) {
        if (new Date().getTime() < timerStopTime) 
          socket.emit('startTimer', timerStopTime);
        else {
          timerRunning = false;
        }
      }

      socket.on("updateLevelFood", async (data) => {
        try {
          const updateFood = await prisma.RefugeeCamp.update({
            where: { id: 1 },
            data: { foodLevel: 10 },
          });
          io.emit("dataBaseUpdated", updateFood);
          console.log("Update food was send");
        } catch (error) {
          console.error(error);
        }
      });

      socket.on("updateCampStats", async (data, region) => {
        console.log("receieved in back end");
        console.log("data: ");
        console.log(data);
        //const{selectedRegion, food, housing, healthcare,} = data
        await prisma.DeployableRegion.update({
          where: {
            id: parseInt(region),
          },
          data: {
            food: parseInt(data.food),
            healthcare: parseInt(data.healthcare),
            housing: parseInt(data.housing),
            admin: parseInt(data.admin),
            refugeesPresent: parseInt(data.refugeesPresent)
          },
        });
        // Broadcast the updated data to all connected clients
        const campStats = await getAllCampStats();
        socket.broadcast.emit('camp_stats', campStats);
        socket.emit('camp_stats', campStats);
      });

      socket.on("updateGenStats", async (data, genName) => {
        console.log("receieved gen update");
        console.log("data: ");
        console.log(data);
        //const{selectedRegion, food, housing, healthcare,} = data
        await prisma.RefugeeGen.update({
          where: {
            id: parseInt(genName),
          },
          data: {
            totalRefugees: parseInt(data.totalRefugees),
            newRefugees: parseInt(data.newRefugees),
            food: parseInt(data.food),
            healthcare: parseInt(data.healthcare),
            admin: parseInt(data.admin)
          },
        });
        // Broadcast the updated data to all connected clients
        const gens = await getAllGens();
        socket.broadcast.emit('gens', gens);
        socket.emit('gens', gens);
      });

      socket.on("startTimer", (seconds) => {
        const now = new Date();
        timerStartTime = now.getTime();
        timerStopTime = timerStartTime + seconds*1000;
        timerRunning = true;
        socket.broadcast.emit('startTimer', timerStopTime);
        socket.emit('startTimer', timerStopTime);
      });
    });
  }
  res.end();
};

export default SocketHandler;