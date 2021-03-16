const express=require("express");
const app=express();
const server=app.listen(4000,()=>{
    console.log("Server is listening on port 4000...")
});
const socket=require("socket.io");
app.use(express.static("public"));
const io=socket(server);
let counter=0;
io.on("connection",function(socket){
    console.log("New connection:"+socket.id);
    
    socket.on("create",function(roomName){
        socket.join(roomName);
       socket.broadcast.emit("created",roomName);
    });
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