const express=require("express");
const app=express();
var activeRooms=[];
var usernames=[];
const server=app.listen(4000,()=>{
    console.log("Server is listening on port 4000...")
});
const socket=require("socket.io");
app.use(express.static("public"));
const io=socket(server);
let counter=0;
io.on("connection",function(socket){
    if(activeRooms.length>0){
    activeRooms.forEach(room => {
        console.log(room);
    });
}
    console.log("New connection:"+socket.id);
    if(activeRooms.length>0){
        activeRooms.forEach(element => {
         if(element!=null){
         socket.emit("active-rooms",element);
         }
     });
 }
    socket.on("hang-up",function(videoId,roomName,myUsername){
        socket.leave(roomName);
        usernames.forEach(u=>{
            if(u===myUsername){
                u="";
            }
        })
        socket.broadcast.to(roomName).emit("hang-up",videoId);
       
    });
    socket.on("closing-room",function(roomName,myUsername){
        for(let i=0;i<activeRooms.length;i++){
            if(activeRooms[i]==roomName){
                console.log("Soba koja ce biti ugasena "+activeRooms[i]);
                activeRooms[i]=null;
            }
        }
        usernames.forEach(u=>{
            if(u===myUsername){
                u="";
            }
        })
        socket.broadcast.emit("force-quit",roomName);
        
    })
    socket.on("message",function(roomName,message,username){
        socket.broadcast.to(roomName).emit("message",message,username);
    })
    socket.on("create",function(roomName){
        let exists=false;
        activeRooms.forEach((element)=>{
            if(element===roomName)
              exists=true;
            })
        socket.emit("creating-failed",exists);
        if(exists===true){
            return;
        }
        activeRooms.push(roomName);
        socket.join(roomName);
       socket.broadcast.emit("created",roomName);
    });
    socket.on("username",function(myUsername){
        var bool=false;
        usernames.forEach(username=>{
            if(username===myUsername){
                bool=true;
                socket.emit("same-username",username);
            }
        })
        if(bool==false){
            socket.emit("valid-username",myUsername);
            usernames.push(myUsername);
        }

    })
    socket.on("ready",function(roomName,socketid){
        var rooms=io.sockets.adapter.rooms;
        var room=rooms.get(roomName);
            if(room!=undefined){
            socket.join(roomName);
            socket.broadcast.to(roomName).emit("ready",socketid,room.size);
            }else{
                console.log("Room does not exist!");
            }
            
    
    });
    socket.on("candidate",function(candidate,roomName){
        socket.broadcast.to(roomName).emit("candidate",candidate);
        
    });
    socket.on("offer",function(offer,roomName,socketid,socketid2,type){
            counter++;
              if(type==='peer'&&counter%2==0){
                  setTimeout(() => {
                    socket.to(socketid).emit("offer",offer,socketid2);
                  }, 1500);
              }else{
                socket.to(socketid).emit("offer",offer,socketid2);
              }
          
      
    });
    socket.on("answer",async function(answer,roomName,socketid2){
       await  socket.to(socketid2).emit("answer",answer);
       
       
    });
    socket.on("answerHere",function(){
        socket.broadcast.to(roomName).emit("answerHere");
    })
});