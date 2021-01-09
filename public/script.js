  
// const socket = io('/');
// const videoGrid = document.getElementById('video-grid');

// const myPeer = new Peer(undefined, {
//   host: '/',
//   port: '3001'
// });

// const myVideo = document.createElement('video');
// myVideo.muted = true;
// const peers = {};
// // Get Video
// navigator.mediaDevices.getUserMedia({
//     video:true,
//     audio:true
// })
// .then(stream=>{
//     console.log(stream);
//     addVideoStream(myVideo,stream);
    
//     // myPeer.on('call',(call)=>{
//     //     console.log("PEER:call")
//     //     call.answer(stream);
//     //     const video = document.createElement("video");
//     //     call.on('stream',userVideoStream=>{
//     //         console.log("PEER:stream")
//     //         addVideoStream(video,userVideoStream);
//     //     })
//     // });

//     myPeer.on('call', call => {
//         call.answer(stream)
//         const video = document.createElement('video')
//         call.on('stream', userVideoStream => {
//           addVideoStream(video, userVideoStream)
//         })
//       })

//     socket.on('user-connected', userId => {
//         connectToNewUser(userId, stream)
//       })
// })

// // On Disconnect
// socket.on('user-disconnected',(userId)=>{
//     if(peers[userId])peers[userId].close();
// })

// // Join Room:
// // Executed when a user opens the link
// myPeer.on('open', id => {
//     socket.emit('join-room', ROOM_ID, id)
//   })

// // connect To New User
// function connectToNewUser(userId,stream){
//     console.log(`ConnectNewUser:${userId}`)
//     const call = myPeer.call(userId,stream);
//     // Video for displaying other user stream
//     const video = document.createElement("video");
//     call.on('stream',(userVideoStream )=>{
//         console.log(`ConnectNewUser's Stream:${userId}`)
//         addVideoStream(video,userVideoStream);
//     });
//     call.on('close',()=>{
//         console.log("CALL CLOSE")
//         video.remove();
//     })
//     peers[userId]=call;
// }
// // Adding video stream
// function addVideoStream(video,stream){
//     video.srcObject=stream;
//     video.addEventListener("loadedmetadata",()=>{
//         console.log("loaded");
//         video.play();
//     })
//     videoGrid.append(video);
// }



const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let myPeer = null;
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
    myPeer= new Peer(undefined, {
        path:"peerjs",
        host: '/',
        port: '443'
    });

    
    myPeer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id);
        addVideoStream(myVideo, stream);
      })

    myPeer.on('call', call => {
        console.log(call)
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})



function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
 
  videoGrid.appendChild(video)
}