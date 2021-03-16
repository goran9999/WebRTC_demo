
const socket=io.connect("http://localhost:4000");
const roomInput=document.getElementById("roomInput");
const createButton=document.getElementById("create");
const activeRooms=document.getElementById("active-room");
const joinButton=document.getElementById("join");
const sendButton=document.getElementById("send");
const chatDiv=document.getElementById("chat");
const videoDiv=document.getElementById("video-div");
const messageDiv=document.getElementById("message");
const myVideo=document.getElementById("myVideo");
const peerVideo=document.getElementById("peerVideo");
var creator=true;
var rtcPeerConnection=null;
var userStream;
let iceServers = {
    iceServers: [
      { urls: "stun:stun.services.mozilla.com" },
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };
createButton.addEventListener('click',function(){
   if(roomInput.value==''){
       alert("Please enter valid room name!");
   }
   else{
       creator=true;
       socket.emit("create",roomInput.value);
       navigator.getUserMedia({
           video:true,
           audio:false
       },function(stream){
           userStream=stream;
           myVideo.srcObject=stream;
          myVideo.onloadedmetadata=function(e){
              myVideo.play();
          }
       },function(err){
           console.log(err);
       });
   }
});
socket.on("created",function(roomName){
  activeRooms.value=roomName;
});
joinButton.addEventListener('click',function(){
  creator=false; 
  navigator.getUserMedia({
      video:true,
      audio:false
    },function(stream){
        userStream=stream;
        socket.emit("ready",activeRooms.value,socket.id);
        myVideo.srcObject=stream;
        myVideo.onloadedmetadata=function(e){
            myVideo.play();
        }
    },function(err){
        console.log(err);
    });
});
socket.on("ready",function(socketid,roomSize){
    rtcPeerConnection=new RTCPeerConnection(iceServers);
    rtcPeerConnection.ontrack=OnTrack;
    rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream);
    //rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream);
    if(creator){
            let type='admin';
            rtcPeerConnection.createOffer().then((offer)=>{
                rtcPeerConnection.setLocalDescription(offer);
                console.log(offer);
                setTimeout(() => {
                     socket.emit("offer",offer,roomInput.value,socketid,socket.id,type);
                 }, 1500);
            });
    }
    if(!creator){
                let type='peer';
                rtcPeerConnection.createOffer().then((offer)=>{
                    rtcPeerConnection.setLocalDescription(offer);
                    console.log(offer);
                    socket.emit("offer",offer,activeRooms.value,socketid,socket.id,type);
                });
            
    }

});
socket.on("offer",async function(offer,socketid2){
        console.log(offer);
        if(!creator){
            let answ;
           rtcPeerConnection=new RTCPeerConnection(iceServers);
            // rtcPeerConnection.addTrack(userStream2.getTracks()[1],userStream2);
            rtcPeerConnection.onicecandidate=OnIceCandidate2;
             rtcPeerConnection.ontrack=OnTrack;
                rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream);
                 rtcPeerConnection.setRemoteDescription(offer);
               await  rtcPeerConnection.createAnswer().then(async(answer)=>{  
                answ=answer;  
               await rtcPeerConnection.setLocalDescription(answer);
                }).then(async()=>{
                    console.log(answ);
               await socket.emit("answer",answ,activeRooms.value,socketid2)
                });
        }
   
});
socket.on("answer",function(answer,roomSize){   
    console.log(answer);
        rtcPeerConnection.setRemoteDescription(answer);
});
socket.on("candidate",function(candidate){
    const iceCandidate=new RTCIceCandidate(candidate);
    rtcPeerConnection.addIceCandidate(iceCandidate);
});

function OnIceCandidate(event){
    if(event.candidate){
    socket.emit("candidate",event.candidate,roomInput.value);
    }
}
function OnIceCandidate2(event){
    if(event.candidate){
    socket.emit("candidate",event.candidate,activeRooms.value);
    }
}
function OnTrack(event){
    var peerVid=document.createElement('video');
    videoDiv.appendChild(peerVid);
    peerVid.srcObject=event.streams[0];
    peerVid.onloadedmetadata=function(e){
        peerVid.play();
    }

}