var http = require("http");
var Config = require('./config.json').server;
var path = require("path");
var fs = require("fs");

var server = http.createServer(function(req, res) {
    var now = new Date();
    var filename = req.url || "index.html";
    filename = (filename == "/")? "index.html" : filename;

    var ext = path.extname(filename);

    var localPath = __dirname;
    var validExtensions = {
        ".html" : "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".txt": "text/plain",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".png": "image/png",
        ".ico": "image/ico"
    };

    if(filename === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        return res.end();
    }

    var isValidExt = validExtensions[ext];

    if (isValidExt) {
        localPath = path.join(localPath, '/public/', filename);

        fs.exists(localPath, function(exists) {
            if(exists) {
                //console.log("Serving file: " + localPath);
                getFile(localPath, res, validExtensions[ext]);
            } else {
                console.log("File not found: " + localPath);
                res.writeHead(404);
                res.end();
            }
        });

    } else {
        console.log("Invalid file extension detected: " + filename)
    }
});

server.listen(Config.port, function() {
    require('./chat_srv').listen(server, function(){
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