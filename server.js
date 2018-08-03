
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
io.sockets.on('connection', function (socket) {

  //接続通知をクライアントに送信
  socket.on("join", function(data){
    usr = {
      'room_id': data.room_id,
      'user_name': data.name
    };
    usrs[data.id] = usr;
    socket.join(data.room_id);
    console.log(usrs);
    io.to(usrs[data.id].room_id).emit("sendMessageToClient", {name: data.name, value:"入室しました。"});
    io.to(usrs[data.id].room_id).emit("count", {count:socket.nsp.server.eio.clientsCount});
    io.to(usrs[data.id].room_id).emit("sendMessageToClient", {name: data.name, value:"入室しました。"});
    io.to(usrs[data.id].room_id).emit("count", {count:socket.nsp.server.eio.clientsCount});
  });

  //クライアントからの受信イベントを設定
  socket.on("sendMessageToServer", function (data) {
    io.to(usrs[data.id].room_id).emit("count", {count:socket.nsp.server.eio.clientsCount});
    io.to(usrs[data.id].room_id).emit("sendMessageToClient", {name: data.name, value:data.value});
  });

  //接続切れイベントを設定
  socket.on("disconnect", function () {
    io.emit("sendMessageToClient", {value:"1人退室しました。"});
    io.emit("count", {a:socket.nsp.server.eio.clientsCount});
  });
});

function doRequest(req,res){
  var path = url.parse(req.url).pathname;
  if(path == '/chatroom.html'){
    fs.readFile('./chatroom.html', 'UTF-8',
    function(err, data) {
      var path = url.parse(req.url).pathname;
      console.log("Request for " + path + "received.");
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }else{
    fs.readFile('./signin.html', 'UTF-8',
    function(err, data) {
      var path = url.parse(req.url).pathname;
      console.log("Request for " + path + "received.");
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }
}
