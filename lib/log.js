const config  = require('./../config.json');
const winston = require('winston');
const path    = require('path');

function getLogger(module) {
  let labelPath = module.filename.split('/').slice(-2).join('/');

  let logPath = path.join(config.logs.log);

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