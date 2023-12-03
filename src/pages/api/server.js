const { Server } = require("socket.io");
import { prisma } from "@/server/db/client";
import { getAllCampStats, getAllRoutes, getAllGens, getGen, updateGen } from "@/lib/stats";
import { verifyJwtToken } from "@/lib/token-auth";
import { courseSectionExists } from "@/lib/courseSection";

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
      const query = socket.handshake.query;
      
      if (!query) {
        socket.emit("load_error", { message: "No query sent" });
        return socket.disconnect();
      }
      
      if (!query.courseSectionId) {
        socket.emit("load_error", { message: "Class number not specified" });
        return socket.disconnect();
      }

      const courseSectionId = parseInt(query.courseSectionId);

      if (!courseSectionId || !(await courseSectionExists(courseSectionId))) {
        socket.emit("load_error", { message: "Class not found" });
        return socket.disconnect();
      }
    
      if (query.token) {
        const decoded = await verifyJwtToken(query.token);
        if (decoded) {
          console.log(`Admin connected: ${socket.id}`);
          socket.decoded = decoded;
          nonAuthenticatedSocketHandlers(socket, courseSectionId);
          authenticatedSocketHandlers(socket);
          return;
        }
    
        console.log(`Admin failed to authenticate: ${socket.id}`);
        socket.emit("auth_error", { message: "Authentication error" });
        return socket.disconnect(true);
      }

      console.log(`User connected: ${socket.id}`);
      nonAuthenticatedSocketHandlers(socket, courseSectionId);
    });

    async function nonAuthenticatedSocketHandlers(socket, courseSectionId) {
      // client has just connected, get initial stats
      const campStats = await getAllCampStats(courseSectionId);
      const routes = await getAllRoutes(courseSectionId);
      const gens = await getAllGens(courseSectionId);
      // send initial stats to client who connected
      socket.emit("camp_stats", campStats, false);
      socket.emit("routes", routes, false);
      socket.emit("gens", gens, false);

      if (timerRunning) {
        const now = new Date().getTime();
        if (now < timerStopTime) {
          //socket.emit('startTimer', timerStopTime);
          socket.emit("syncClock", now);
        } else {
          timerRunning = false;
        }
      }

      socket.on("syncClock", (clientTime, offset) => {
        const now = new Date().getTime;
        const avgOffset = (now - clientTime + offset) / 2;
        socket.emit("startTimer", avgOffset, timerStopTime);
      });
    }

    async function authenticatedSocketHandlers(socket) {
      socket.on("updateCampStats", async (data, region, courseSectionId) => {
        const camp = await prisma.DeployableRegion.findFirst({
          where: {
              jsonId: parseInt(region),
              courseSectionId,
          }
        });
        if (camp) {
          await prisma.DeployableRegion.update({
            where: {
              id: camp.id,
            },
            data: {
              food: parseInt(data.food),
              healthcare: parseInt(data.healthcare),
              housing: parseInt(data.housing),
              admin: parseInt(data.admin),
              refugeesPresent: parseInt(data.refugeesPresent),
            },
          });
          // Broadcast the updated data to all connected clients
          const campStats = await getAllCampStats(courseSectionId);
          socket.broadcast.emit("camp_stats", campStats, true);
          socket.emit("camp_stats", campStats, true);
        }
      });

      socket.on("updatePathStats", async (data, pathName, courseSectionId) => {
        const route = await prisma.Route.findFirst({
          where: {
              jsonId: parseInt(pathName),
              courseSectionId,
          }
        });
        if (route) {
          await prisma.Route.update({
            where: {
              id: route.id,
            },
            data: {
              isOpen: data.isOpen,
            },
          });
          // Broadcast the updated data to all connected clients
          const routes = await getAllRoutes(courseSectionId);
          socket.emit("routes", routes, true);
          socket.broadcast.emit("routes", routes, true);
        }
      });

      socket.on("updateGenStats", async (data, genName, courseSectionId) => {
        //console.log(data)
        const gen = await getGen(courseSectionId, parseInt(genName));
        if (gen) {
          await updateGen(data, gen.id);
          // Broadcast the updated data to all connected clients
          const gens = await getAllGens(courseSectionId);
          socket.broadcast.emit("gens", gens, true);
          socket.emit("gens", gens, true);
        }
      });

      socket.on("startTimer", (seconds) => {
        const now = new Date();
        timerStartTime = now.getTime();
        timerStopTime = timerStartTime + seconds * 1000;
        timerRunning = true;
        socket.emit("syncClock", now);
        socket.broadcast.emit("syncClock", now);
      });

      socket.on("stopTimer", () => {
        timerRunning = false;
        socket.emit("stopTimer");
        socket.broadcast.emit("stopTimer");
      });
    }
  }
  res.end();
};

export default SocketHandler;
