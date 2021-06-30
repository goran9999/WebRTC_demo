
const socket = io.connect("http://localhost:4000");
const roomInput = document.getElementById("roomInput");
const createButton = document.getElementById("create");
const activeRooms = document.getElementById("active-room");
const joinButton = document.getElementById("join");
const sendButton = document.getElementById("send");
const chatDiv = document.getElementById("chat");
const videoDiv = document.getElementById("video-div");
const messageDiv = document.getElementById("message");
const myVideo = document.getElementById("myVideo");
const peerVideo = document.getElementById("peerVideo");
const activeMeetings = document.getElementById("active-meetings");
const peerVideos = document.getElementById("peer-videos");
const camOff = document.getElementById("cameraOff");
const micOff = document.getElementById("microphoneOff")
const hangUp = document.getElementById("hang-up");
const closeRoom = document.getElementById("close-room");
const usernameDiv = document.getElementById("username-div");
const chatLobby = document.getElementById("video-chat-lobby");
const save = document.getElementById("save");
const username = document.getElementById("username")
const header = document.getElementById("header")
let activeCalls = [];
let peerVids = [];
let peerDivs=[];
let joinButtons = [];
let connections = [];
let count = 0;
let order, connRoom, myRoom, myUsername;
let cam = true, mic = true;
var creator = true;
var rtcPeerConnection = null;
var userStream;
let btns = [];
//btns.push(joinButton);

class Button {
    constructor(button, counter) {
        this.button = button;
        this.counter = counter;
    }
}
camOff.addEventListener('click', function () {
    cam = !cam;
    userStream.getTracks()[0].enabled = cam;
});

micOff.addEventListener('click', function () {
    mic = !mic;
    userStream.getTracks()[1].enabled = mic;
})

closeRoom.addEventListener('click', function () {
    socket.emit("closing-room", roomInput.value, myUsername);
    creator = false;
    myRoom = null;
    var stream = myVideo.srcObject;
    var tracks = stream.getTracks();
    tracks.forEach(t => {
        t.stop();
    });
    connections.forEach(conn => {
        conn.close();
    })
    peerVids.forEach(vid => {
        vid.remove();
    })
    myVideo.style.display = "none";
    videoDiv.style.display = "none";
    document.getElementById("videoButtons").style.display = "none";
    document.getElementById("chat-div").style.display = "none";
    document.getElementById("active-meetings").style.display = "flex";
    document.getElementById("close-room").style.display = "none";
    chatLobby.style.display = "block";
    chatLobby.style.marginTop = "250px";
    chatLobby.style.marginLeft = "450px";

})
hangUp.addEventListener('click', function () {
    //alert(connRoom);
    //  if(creator){
    //      socket.emit("hang-up",myVideo.srcObject.id,roomInput.value);
    //  }
    //else{
    socket.emit("hang-up", myVideo.srcObject.id, connRoom, myUsername);
    //}
    myRoom = null;
    var stream = myVideo.srcObject;
    var tracks = stream.getTracks();
    tracks.forEach(t => {
        t.stop();
    });
    connections.forEach(conn => {
        conn.close();
    })
    peerVids.forEach(vid => {
        vid.parentElement.remove();
        
    })
    myVideo.style.display = "none";
    videoDiv.style.display = "none";
    document.getElementById("videoButtons").style.display = "none";
    document.getElementById("chat-div").style.display = "none";
    document.getElementById("active-meetings").style.display = "flex";
    chatLobby.style.display = "block";
    chatLobby.style.marginTop = "200px";
    chatLobby.style.marginLeft = "450px";
});
save.addEventListener("click", function () {
    if (username.value == '') {
        alert("Please enter valid username!");
    }
    else {
        myUsername = username.value;
        username.value = '';
        socket.emit("username", myUsername);

    }
});
sendButton.addEventListener('click', function () {
    if (messageDiv.value == '') {
        return;
    }
    let message = document.createElement('div');
    message.id = "text";
    let p = document.createElement('p');
    p.id = "time";
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    p.innerHTML = time;
    message.appendChild(p);
    let p2 = document.createElement('div');
    p2.id = "messa";
    p2.innerHTML = messageDiv.value;
    message.appendChild(p2);
    chatDiv.appendChild(message);
    socket.emit("message", myRoom, messageDiv.value, myUsername);
    messageDiv.value = '';
})
let iceServers = {
    iceServers: [
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun.l.google.com:19302" },
    ],
};
createButton.addEventListener('click', function () {
    activeMeetings.style.display = "none";
    //document.getElementById("video-div").style.display="grid-auto-flow:row";
    document.getElementById("myVideo").style.display = "block";
    document.getElementById("video-div").style.display = "grid";
    hangUp.style.display = "none";
    document.getElementById("close-room").style.display = "block";
    if (roomInput.value == '') {
        alert("Please enter valid room name!");
    }
    else if (myUsername == undefined) {
        alert("Please enter valid username!")
    }
    else {
        creator = true;
        socket.emit("create", roomInput.value);
        myRoom = roomInput.value;
        socket.on("creating-failed", function (exists) {
            if (exists === true) {
                alert("Room with this name alredy exists!");
                roomInput.value = "";
                return;
            }
            chatLobby.style.display = "none";
            usernameDiv.style.display = "none";
            document.getElementById("videoButtons").style.display = "flex";
            document.getElementById("chat-div").style.display = "block";
            navigator.getUserMedia({
                video: true,
                audio: false
            }, function (stream) {
                userStream = stream;
                myVideo.srcObject = stream;
                myVideo.onloadedmetadata = function (e) {
                    myVideo.play();
                }
            }, function (err) {
                console.log(err);
            });
        });
    }
});
socket.on("created", function (roomName) {
    //activeRooms.value=roomName;
    //btns.push(myButton);
    var newButton = document.createElement('button');
    var newTextBox = document.createElement('p');
    newButton.className = roomName;
    let myButton = new Button(newButton, count);
    order = count;
    count = count + 1;
    newTextBox.id = "active-room";
    newButton.id = "join";
    newTextBox.innerHTML = roomName;
    newButton.textContent = 'Join';
    joinButtons.push(newButton);
    activeCalls.push(newTextBox);

    const meetingsList = document.getElementById('meetings-list');
    const meeting = document.createElement('li');
    meeting.appendChild(newTextBox);
    meeting.appendChild(newButton);
    meetingsList.appendChild(meeting);


    //    activeMeetings.appendChild(newButton);
    //    activeMeetings.appendChild(newTextBox);
    newButton.onclick = click(myButton, count);
});
function click(e, c) {
    e.button.addEventListener('click', function () {
        if (myUsername == undefined) {
            alert("Please enter valid username!");
        }
        else {
            activeMeetings.style.display = "none";
            //videoDiv.style.display="block";
            //videoDiv.style.visibility = "inital";
            closeRoom.style.display = "none";
            document.getElementById("myVideo").style.display = "block";
            document.getElementById("video-div").style.display = "grid";
            chatLobby.style.display = "none";
            usernameDiv.style.display = "none";
            creator = false;
            order = c - 1;

            for (let i = 0; i < peerVids.length; i++) {
                let bool = false;
                for (let j = 0; j < peerVids.length; j++) {
                    if (peerVids[i].id == peerVids[j].id || peerVids[i] == undefined) {
                        bool = true;
                    }
                }
                if (bool == true) {
                    peerVids[i].remove();
                }
            }
            console.log("Redni broj dugmeta:" + c);
            document.getElementById("videoButtons").style.display = "flex";
            document.getElementById("chat-div").style.display = "block";
            console.log("Broj tekst divova:" + activeCalls.length);
            navigator.getUserMedia({
                video: true,
                audio: false
            }, function (stream) {
                userStream = stream;
                connRoom = activeCalls[order].innerText;
                myRoom = activeCalls[order].innerText;
                socket.emit("ready",/*activeRooms.value*/activeCalls[order].innerText, socket.id);
                myVideo.srcObject = stream;
                myVideo.onloadedmetadata = function (e) {
                    myVideo.play();
                }
            }, function (err) {
                console.log(err);
            });
        }
    });
}
/*for(var i=0;i<btns.length;i++){
btns[i].addEventListener('click',function(){
  creator=false; 
  navigator.getUserMedia({
      video:true,
      audio:false
    },function(stream){
        userStream=stream;
        socket.emit("ready",activeRooms.value,activeCalls[i].value,socket.id);
        myVideo.srcObject=stream;
        myVideo.onloadedmetadata=function(e){
            myVideo.play();
        }
    },function(err){
        console.log(err);
    });
});
}*/
socket.on("ready", function (socketid, roomSize) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    connections.push(rtcPeerConnection);
    rtcPeerConnection.ontrack = OnTrack;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    //rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream);
    if (creator) {
        let type = 'admin';
        rtcPeerConnection.createOffer().then((offer) => {
            rtcPeerConnection.setLocalDescription(offer);
            console.log(offer);
            setTimeout(() => {
                socket.emit("offer", offer, roomInput.value, socketid, socket.id, type);
            }, 1500);
        });
    }
    if (!creator) {
        let type = 'peer';
        rtcPeerConnection.createOffer().then((offer) => {
            rtcPeerConnection.setLocalDescription(offer);
            console.log(offer);
            socket.emit("offer", offer,/*activeRooms.value*/activeCalls[order].innerText, socketid, socket.id, type);
        });

    }

});
socket.on("offer", async function (offer, socketid2) {
    console.log(offer);
    if (!creator) {
        let answ;
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        connections.push(rtcPeerConnection);
        // rtcPeerConnection.addTrack(userStream2.getTracks()[1],userStream2);
        rtcPeerConnection.onicecandidate = OnIceCandidate2;
        rtcPeerConnection.ontrack = OnTrack;
        rtcPeerConnection.onremovestream = function () {
            alert("Track removed")
        }
        rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
        rtcPeerConnection.setRemoteDescription(offer);
        await rtcPeerConnection.createAnswer().then(async (answer) => {
            answ = answer;
            await rtcPeerConnection.setLocalDescription(answer);
        }).then(async () => {
            console.log(answ);
            await socket.emit("answer", answ,/*activeRooms.value*/activeCalls[order].innerText, socketid2)
        });
    }

});
socket.on("answer", function (answer, roomSize) {
    console.log(answer);
    rtcPeerConnection.setRemoteDescription(answer);

});
socket.on("candidate", function (candidate) {
    const iceCandidate = new RTCIceCandidate(candidate);
    rtcPeerConnection.addIceCandidate(iceCandidate);
});
socket.on("hang-up", function (videoID) {
    var currentPeerDiv = document.getElementById(videoID);
    //alert(videoID+"will be removed");
    if (currentPeerDiv != null) {
        currentPeerDiv.parentElement.remove();
        //currentPeerDiv.remove();
    }

    peerVids.forEach(vid => {
        if (vid.id == videoID) {
            //peerVids.remove(vid);

        }
    })
})
socket.on("force-quit", function (roomName) {
    // alert("Admin closed room!");
    let j;
    for (let i = 0; i < activeCalls.length; i++) {
        if (activeCalls[i].innerText == roomName) {
            j = i;
            console.log(activeCalls)
            alert(activeCalls[i].innerText)

            activeCalls[i].parentElement.getElementsByTagName('button')[0].remove()
            activeCalls[i].remove();
        }
    }
    for (let i = 0; i < joinButtons.length; i++) {
        if (joinButtons[i].className == roomName) {
            joinButtons[i].remove();
        }
    }
    //activeMeetings[j].remove();
    /*if(joinButtons[j]!=undefined){
    joinButtons[j].style.display="none";
    }*/
    alert(myRoom);
    if (myRoom == roomName) {
        hangUp.click();
        myRoom = null;
    }
    if (myRoom == roomName) {
        document.getElementById("videoButtons").style.display = "none";
        document.getElementById("chat-div").style.display = "none";
    }
})
socket.on("message", function (mess, username) {
    let message = document.createElement('div');
    message.id = "text2";
    let p = document.createElement('p');
    p.id = "time";
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    p.innerHTML = time;
    message.appendChild(p);
    let p2 = document.createElement('div');
    p2.id = "messa";
    p2.innerHTML = username.bold() + "\n" + mess;
    message.appendChild(p2);
    chatDiv.appendChild(message);



})
socket.on("active-rooms", function (element) {
    var newButton = document.createElement('button');
    var newTextBox = document.createElement("p");
    let myButton = new Button(newButton, count);
    order = count;
    count = count + 1;
    newTextBox.id = "active-room";
    newButton.id = "join";
    newTextBox.innerHTML = element;
    newButton.textContent = 'Join';
    activeCalls.push(newTextBox);
    const meetingsList = document.getElementById('meetings-list');
    const meeting = document.createElement('li');
    meeting.appendChild(newTextBox);
    meeting.appendChild(newButton);
    meetingsList.appendChild(meeting);
    newButton.onclick = click(myButton, count);
    // activeMeetings.appendChild(newButton);
    // activeMeetings.appendChild(newTextBox);
});
socket.on("same-username", function (user) {
    username.value = "";
    alert("Username " + user + " alredy exists!");
})
socket.on("valid-username", function (user) {
    const username = document.createElement('div');
    var user2 = user.toUpperCase();
    username.innerHTML = user2;
    header.appendChild(username);
    username.style.float = "right";
    username.style.marginRight = "15px";
    username.style.marginTop = "30px";
    username.style.fontSize = "25px";
    username.style.color = "green";
})

function OnIceCandidate(event) {
    if (event.candidate) {
        socket.emit("candidate", event.candidate, roomInput.value);
    }
}
function OnIceCandidate2(event) {
    if (event.candidate) {
        socket.emit("candidate", event.candidate,/*activeRooms.value*/activeCalls[order].innerText);
    }
}
function OnTrack(event) {
    var peerDiv = document.createElement('div');
    var peerVid = document.createElement('video');
    peerDiv.appendChild(peerVid);
    peerVids.push(peerVid);
    peerDivs.push(peerDiv);
    peerVid.id = event.streams[0].id
    peerVid.className = "peerVideo";
    peerDiv.className = "peerDiv";
    //videoDiv.appendChild(peerDiv);
    peerVideos.appendChild(peerDiv);
    peerVid.srcObject = event.streams[0];
    peerVid.onloadedmetadata = function (e) {
        peerVid.play();

    }

}