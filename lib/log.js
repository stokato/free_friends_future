var config = require('./../config.json');
var winston = require('winston');

function getLogger(module) {
  var path = module.filename.split('/').slice(-2).join('/');

  return new winston.Logger({
    transports : [
      new winston.transports.Console({
        colorize: true,
        level : 'debug',
        label : path
      }),
      new winston.transports.File({filename : config.logs.log})
    ]
  });
}

module.exports = getLogger;