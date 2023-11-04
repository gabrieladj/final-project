const {Server} = require("socket.io")

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io
    
    io.on("connection",(socket) =>{
        console.log(`User connected: ${socket.id}`)

        socket.on("send_message",(data) => {
            socket.broadcast.emit("receive_message", data);
            console.log('Recieved message');
        }) 
    })
  }
  res.end()
}

export default SocketHandler