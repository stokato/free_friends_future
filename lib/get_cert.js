var fs = require("fs");
var path = require('path');

module.exports = function(req, res, next) {

  //return res.redirect(path.join(__dirname));

  if(req.method == 'GET' && req.url.search(/well-known/) != -1) {
    var localPath = path.join(__dirname, req.url);

    fs.exists(localPath, function(exists) {
      if(exists) {
        fs.readFile(localPath, function(err, contents) {
          if(!err) {
            res.setHeader("Content-Length", contents.length);
            res.setHeader("Content-Type", "text/html");
            res.statusCode = 200;
            res.end(contents);
          } else {
            res.writeHead(500);
            res.end();
          }
        });
      } else {
        log.error("File not found: " + localPath);
        res.writeHead(404);
        res.end();
      }
    });
  } else {
    next();
  }
};
