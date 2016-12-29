const fs = require("fs");
const path = require('path');
const logger = require('./log')(module);

module.exports = function(req, res, next) {

  //return res.redirect(path.join(__dirname));

  if(req.method == 'GET' && req.url.search(/well-known/) != -1) {
    let localPath = path.join(__dirname, req.url);

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
        logger.error("File not found: " + localPath);
        res.writeHead(404);
        res.end();
      }
    });
  } else {
    next();
  }
};
