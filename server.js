const express = require("express");
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer, PeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
}); 
const { v4: uuidV4 } = require('uuid')
// Use
app.use('/peerjs', peerServer);

// View and public
app.set('view engine', 'ejs')

app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
  })

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
  })
  
// Socket
io.on("connection",(socket)=>{
    
   
    socket.on('join-room', (roomId, userId, username) => {
      socket.join(roomId)
      console.log("SERVER:",userId)
      socket.to(roomId).broadcast.emit('user-connected',{userId,username})
      
      socket.on("message",(message)=>{
        //console.log("Room:",roomId)

        io.in(roomId).emit("createMessage",{userId,message,username})
      })
      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })
    })
})
// Port
const port = 3030;
server.listen(process.env.PORT || port,()=>{
    console.log("Application running successfully on port:",port)
})