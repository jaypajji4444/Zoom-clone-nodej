const express = require("express");
const http = require("http");
// peer
const {ExpressPeerServer} = require("peer");

const { v4: uuidV4 } = require('uuid');
const socketIo = require("socket.io");
// Setting app
const app = express();
const server = http.createServer(app);
// Socket Server
const io = socketIo(server);

// Peer Server
const peerServer = ExpressPeerServer(server,{
  debug:true
})
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
    // socket.on("join-room",(roomId,userId)=>{
    //     socket.join(roomId);
    //     socket.to(roomId).broadcast.emit('user-connected', userId)
    //     console.log(`User:${userId} joined room ${roomId}`)
    //     socket.on('disconnect', () => {
    //       socket.to(roomId).broadcast.emit('user-disconnected', userId)
    //     })
    // })
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('user-connected', userId)
  
      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })
    })
})
// Port
const port = 8080;
server.listen(process.env.PORT || port,()=>{
    console.log("Application running successfully on port:",port)
})