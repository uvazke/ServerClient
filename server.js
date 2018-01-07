//サーバ作成
var http = require('http');
var server = http.createServer(doRequest);
var io = require('socket.io').listen(server);
var fs = require('fs');
var url = require("url");
//server.on('request', doRequest);
server.listen(process.env.PORT || 8000);
console.log('server runnning');
//クライアント接続があると、以下の処理をさせる。
io.sockets.on('connection', function (socket) {
  console.log('connected');
  //接続通知をクライアントに送信
  socket.on("sendNameToServer", function(data){
    io.emit("sendMessageToClient", {name: data.value, value:"1人入室しました。"});
    io.emit("count", {count:socket.nsp.server.eio.clientsCount});
  });

  //クライアントからの受信イベントを設定
  socket.on("sendMessageToServer", function (data) {
      io.emit("sendMessageToClient", {value:data.value});
  });

  //接続切れイベントを設定
  socket.on("disconnect", function () {
      io.emit("sendMessageToClient", {value:"1人退室しました。"});
      io.emit("count", {a:socket.nsp.server.eio.clientsCount});
  });
});

function doRequest(req,res){
  fs.readFile('./signin.html', 'UTF-8',
  function(err, data) {
    var path = url.parse(req.url).pathname;
    console.log("Request for " + path + "received.");
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
}
