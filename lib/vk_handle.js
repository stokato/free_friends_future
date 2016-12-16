var log = require('./log')(module);

var vk = require('./../bin/vk');
var vkManager = new vk();

module.exports = function(req, res, next) {
  if(req.method == 'POST' && req.url == '/') {
    log.debug(req.body);

    var profiles = req.app.get('profiles');
    var stat = req.app.get('stat');
    vkManager.handle(req.body, profiles, stat, function(err, response) {
      if (err) { return log.debug(err.message); }

      res.end(response);
      log.debug(response);
    });
  } else {
    next();
  }
};