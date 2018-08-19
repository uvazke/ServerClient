
//サーバ作成
/*
express = require('express');
var app = express();
var session = require('express-session');
var sessionMiddleware = session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie:{
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 30
}});
*/
var http = require('http');
var server = http.createServer(doRequest);

var io = require('socket.io').listen(server);
var fs = require('fs');
var url = require("url");

server.listen(process.env.PORT || 8000);

console.log('server runnning');
var id = 0;
var usrs = {};
var counts = {};
var n=2;
for(var i=0;i<n;i++){
  counts[i]=0;
}
io.sockets.on('connection', function (socket) {

  //接続通知をクライアントに送信
  socket.on("join", function(data){
    usr = {
      'room_id': data.room_id,
      'user_name': data.name
    };
    usrs[socket.id] = usr;
    counts[data.room_id]++; 
    socket.join(data.room_id);
    io.to(usrs[socket.id].room_id).emit("sendMessageToClient", {name: data.name, value:"入室しました。"});
    io.to(usrs[socket.id].room_id).emit("count", {count:counts[data.room_id]});
  });

  //クライアントからの受信イベントを設定
  socket.on("sendMessageToServer", function (data) {
    io.to(usrs[socket.id].room_id).emit("count", {count:counts[usrs[socket.id].room_id]});
    io.to(usrs[socket.id].room_id).emit("sendMessageToClient", {name: data.name, value:data.value});
    console.log(usrs[socket.id].room_id)
  });

  //接続切れイベントを設定
  socket.on("disconnect", function () {
    counts[usrs[socket.id].room_id]--;
    io.emit("sendMessageToClient", {value:"1人退室しました。"});
    io.emit("count", {count:counts[usrs[socket.id].room_id]});
    if(usrs[socket.id])delete usrs[socket.id];
  });
});

function doRequest(req,res){
  var path = url.parse(req.url).pathname;
  if(path == '/chatroom.html'){
    fs.readFile('./chatroom.html', 'UTF-8',
    function(err, data) {
      console.log("Request for " + path + "received.");
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }else if(path == '/css/style.css'){
    fs.readFile('./css/style.css', 'UTF-8',
      function(err, data) {
      console.log("Request for " + path + "received.");
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.write(data);
      res.end();
    });
  }else{
    fs.readFile('./signin.html', 'UTF-8',
    function(err, data) {
      console.log("Request for " + path + "received.");
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }
}
