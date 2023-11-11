const {Server} = require("socket.io")
import { prisma } from "../../server/db/client";
import {getAllCampStats, getAllRoutes} from "../../lib/stats"

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on("connection",async (socket) =>{
        console.log(`User connected: ${socket.id}`);
        // client has just connected, send initialstats
        const campStats =  await getAllCampStats();
        socket.emit('camp_stats', campStats);
        const routes =  await getAllRoutes();
        socket.emit('routes', routes);
        
        socket.on("send_message",(data) => {
            socket.broadcast.emit("receive_message", data);
            //console.log('Recieved message');
        });

        socket.on('updateLevelFood',async (data) => {
          try{
            const updateFood = await prisma.RefugeeCamp.update({
              where: { id: 1},
              data: {foodLevel : 10},


            })
            io.emit('dataBaseUpdated',updateFood)
            console.log("Update food was send")
          }catch(error){
            console.error(error)
          }
        })
    })
  }
  res.end()
}

export default SocketHandler