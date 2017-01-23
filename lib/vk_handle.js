const  log = require('./log')(module);

const  VK = require('./../bin/vk');
const  vkManager = new VK();

module.exports = function(req, res, next) {
  if(req.method == 'POST' && req.url == '/') {
    log.debug(req.body);

    // let  profiles = req.app.get('profiles');
    
    vkManager.handle(req.body, function(err, response) {
      if (err) {
        return log.debug(err.message);
      }

      res.end(response);
      log.debug(response);
    });
  } else {
    next();
  }
};