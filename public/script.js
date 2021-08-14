  
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
const myVideo = document.createElement('video')
myVideo.muted = true
// Glovbal Varaible
const peers = {}
let myPeer = null;
let myVideoStream;
let currentUser={userId:null,username:"user"};

currentUser.username=prompt("Enter your display name","user");

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
    // Initiliz Stream to handle mute/stop video
    myVideoStream=stream;
    
    myPeer= new Peer(undefined, {
        path:"peerjs",
        host: '/',
        port: '3030'
    });

    
    myPeer.on('open', id => {
      console.log("coolpa")
        currentUser.userId=id;
        socket.emit('join-room', ROOM_ID, id , currentUser.username );
        addVideoStream(myVideo, stream, currentUser);
      })

    myPeer.on('call', (call) => {
       console.log("CALL:",call)
        call.answer(stream)
       
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          console.log("Stream",userVideoStream.user)
        addVideoStream(video, userVideoStream, userVideoStream.user)
        })
    })

    socket.on('user-connected', ({userId,username}) => {
      console.log(userId)
        connectToNewUser(userId, username, stream)
    });

    // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
      //   $("ul").append(`<li class="message"><b>${currentUser.username}:</b>${text.val()}</li>`);
      // scrollToBottom()
        text.val('')
        

      }
    });
    socket.on("createMessage", ({userId,message,username}) => {
      $("ul").append(`<li class="message"><b>${username}:</b>${message}</li>`);
      scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})



function connectToNewUser(userId, username, stream) {
  console.log("Connect:",userId)
  const userObject = {userId,username}
  
  const call = myPeer.call(userId, stream,{user:currentUser})
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream , userObject)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream , user={userId:"n",username:"n"}) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  let div=document.createElement("div");
  div.setAttribute("class","video_container");
  div.appendChild(video);
  const name = document.createElement("div");
  name.setAttribute("class","bottom-right");
  name.innerHTML=`${user.username}`
  div.appendChild(name)
  videoGrid.appendChild(div);
  console.log(peers)

}




const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

