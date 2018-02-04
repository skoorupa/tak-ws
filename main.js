var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

const WebSocket = require('ws');
var clients = [];
var file;

const wss = new WebSocket.Server({ port: process.env.PORT });

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
