const { Server } = require("socket.io");
import { prisma } from "../../server/db/client";
import { getAllCampStats, getAllRoutes, getAllGens } from "../../lib/stats";
import {getJwtSecretKey, verifyJwtToken} from "../../lib/token-auth";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    // timer stuff in milliseconds
    var timerStartTime = 0;
    var timerStopTime = 0;
    var timerRunning = false;
    
    io.on("connection", async (socket) => {
      if (socket.handshake.query && socket.handshake.query.token){
        var decoded = await verifyJwtToken(socket.handshake.query.token);
        if (decoded) {
          console.log(`Admin connected: ${socket.id}`);
          // Connection authenticated for this socket
          socket.decoded = decoded;
          nonAuthenticatedSocketHandlers(socket);
          authenticatedSocketHandlers(socket);
        }
        else {
          console.log(`Admin failed to authenticate: ${socket.id}`);
          // Handle authentication error for authenticated users
          socket.emit('auth_error', { message: 'Authentication error' });
          socket.disconnect(true); // Disconnect the socket due to authentication error
        }
      }
      else {
        console.log(`User connected: ${socket.id}`);
        nonAuthenticatedSocketHandlers(socket);
      }      
    });

   async function nonAuthenticatedSocketHandlers(socket) {
      // client has just connected, get initial stats
      const campStats = await getAllCampStats();
      const routes = await getAllRoutes();
      const gens = await getAllGens();
      // send initial stats to client who connected
      socket.emit("camp_stats", campStats, false);
      socket.emit("routes", routes, false);
      socket.emit("gens", gens, false);

      if (timerRunning) {
        const now = new Date().getTime();
        if (now < timerStopTime) {
          //socket.emit('startTimer', timerStopTime);
          socket.emit('syncClock', now);
        }
        else {
          timerRunning = false;
        }
      }

      socket.on("syncClock", (clientTime, offset) => {
        const now = new Date().getTime;
        const avgOffset = ((now - clientTime) + offset)/2;
        socket.emit('startTimer', avgOffset, timerStopTime);
      });
    }

    async function authenticatedSocketHandlers(socket) {
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
        socket.broadcast.emit('camp_stats', campStats, true);
        socket.emit('camp_stats', campStats, true);
      });

      socket.on("updatePathStats", async (data, pathName) => {
        console.log("receieved path update");
        console.log("data: ");
        console.log(data);
        //const{selectedRegion, food, housing, healthcare,} = data
        await prisma.Route.update({
          where: {
            id: parseInt(pathName),
          },
          data: {
            isOpen: data.isOpen
          },
        });
        // Broadcast the updated data to all connected clients
        const routes = await getAllRoutes();
        socket.emit("routes", routes, true);
        socket.broadcast.emit("routes", routes, true);
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
            admin: parseInt(data.admin),
            genType: data.genType
          },
        });
        // Broadcast the updated data to all connected clients
        const gens = await getAllGens();
        socket.broadcast.emit('gens', gens, true);
        socket.emit('gens', gens, true);
      });

      socket.on("startTimer", (seconds) => {
        const now = new Date();
        timerStartTime = now.getTime();
        timerStopTime = timerStartTime + seconds*1000;
        timerRunning = true;
        socket.emit('syncClock', now);
        socket.broadcast.emit('syncClock', now);
      });

      socket.on("stopTimer", () => {
        timerRunning = false;
        socket.emit('stopTimer');
        socket.broadcast.emit('stopTimer');
      });
    }
  }
  res.end();
};

export default SocketHandler;