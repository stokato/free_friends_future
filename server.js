var http = require("http");
var Config = require('./config.json').server;
var path = require("path");
var fs = require("fs");

var socketio = require('socket.io-client');

var vk = require('./bin/vk');
var vkManager = new vk();

var qs = require('querystring');

var socket;

var server = http.createServer( function(req, res) {

  if(req.method == 'POST') {
    var body = '';

    req.on('data', function (data) {
      body += data;

      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
        req.connection.destroy();
    });

    req.on('end', function () {
      var post = qs.parse(body);

      vkManager.handle(post, socket, function(err, response) {
        if (err) { return console.log(err.message); }

        res.end(response);
        console.log(response);
      });
    });
  }

  var localPath;
  if(req.method == 'GET' && (req.url.indexOf('well-known') == -1)) {

    localPath = path.join(__dirname, '/public/', "index.html");

    fs.exists(localPath, function(exists) {
      if(exists) {
        getFile(localPath, res, "text/html");
      } else {
        console.log("File not found: " + localPath);
        res.writeHead(404);
        res.end();
      }
    });
  }

  if(req.method == 'GET' && (req.url.indexOf('well-known') != -1)) {

    localPath = path.join(__dirname, req.url);

    fs.exists(localPath, function(exists) {
      if(exists) {
        getFile(localPath, res, "text/html");
      } else {
        console.log("File not found: " + localPath);
        res.writeHead(404);
        res.end();
      }
    });
  }
});

server.listen(Config.port, function() {
  require('./bin/io').listen(server, function(err){
    if(err) return console.log(err.message);

    socket = socketio.connect('http://localhost:3000');
    socket.emit('server_init');

    console.log('server running at: ' + Config.host + ':' + Config.port);
  });
});

function getFile(localPath, res, mimeType) {
  fs.readFile(localPath, function(err, contents) {
    if(!err) {
      res.setHeader("Content-Length", contents.length);
      res.setHeader("Content-Type", mimeType);
      res.statusCode = 200;
      res.end(contents);
    } else {
      res.writeHead(500);
      res.end();
    }
  });
}