var config = require('./../config.json');
var winston = require('winston');
var path = require('path');

function getLogger(module) {
  var labelPath = module.filename.split('/').slice(-2).join('/');

  var logPath = path.join(config.logs.log);

  return new winston.Logger({
    transports : [
      new winston.transports.Console({
        colorize: true,
        level : 'debug',
        label : labelPath
      }),
      new winston.transports.File({filename : logPath})
    ]
  });
}

module.exports = getLogger;