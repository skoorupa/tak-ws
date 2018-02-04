var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var filename;
  console.log("."+q.pathname);

  var deny = ["/main.js","/package.json","/package-lock.json","node_modules"];
  var denyfolders = ["node_modules"];
  var detectdeny = false;

  console.log(q.pathname.split("/")[0]);

  detectdeny = deny[q.pathname] || deny[q.pathname.split("/")[1]]

  if (q.pathname!="/")
    filename = "."+q.pathname;
  else
    filename = "./index.html";

  fs.readFile(filename, function(err, data) {
    if (err || detectdeny) {
      if (detectdeny){
        console.log("connection denied");
        res.writeHead(403, {'Content-Type': 'text/html'});
        return res.end("403 Forbidden");
      } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        return res.end("404 Not Found :(");
      }
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}).listen(port);

const WebSocket = require('ws');
var clients = [];
var file;

const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', function connection(ws) {
  fs.readFile("chat.txt", function (err, data) {
    file = data + "!!! new guy joined!" + "\n";
    fs.writeFile("chat.txt", file, function () {
      ws.send(file);
    });
  });
  clients[clients.length] = ws;
  clients[clients.length-1].on('message', function incoming(message) {
    console.log('received: %s', message);
    try {
      fs.readFile("chat.txt", function (err, data) {
        file = data + message + "\n";
        fs.writeFile("chat.txt", file, function () {
          daj();
        });
      });
    } catch (e) {
      console.error(e);
    }
  });
  clients[clients.length-1].on('error', function(e){
    clients.splice(clients.indexOf(this),1);
  });
});

wss.on('close', function close() {
  console.log('disconnected');
});

function daj() {
  for (var i = 0; i < clients.length; i++) {
    clients[i].send(file);
  }
}
