const { Server } = require("socket.io");
import { prisma } from "../../server/db/client";
import { getAllCampStats, getAllRoutes, getAllGens } from "../../lib/stats";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

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

      socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data);
      });

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
    });
  }
  res.end();
};

export default SocketHandler;