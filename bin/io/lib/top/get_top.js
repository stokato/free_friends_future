/**
 * Получаем топ игроков
 *
 * @param socket, options, callback
 * @return {Object} - объект с общим топом, топом парней и девушек
 */

const constants  = require('./../../../constants');
const db         = require('./../../../db_manager');
const emitRes    = require('./../../../emit_result');
const Config    = require('./../../../../config.json');

const GUY = Config.user.constants.sex.male;
const GIRL = Config.user.constants.sex.female;

module.exports = function (socket, options) {
  
  let res = {};
  db.findPoints(null, function (err, users) {
    if (err) { return emitRes(err, socket, constants.IO_GET_TOP); }
    res[constants.PFIELDS.ALL] = users;
    
    db.findPoints(GIRL, function (err, users) {
      if (err) { return emitRes(err, socket, constants.IO_GET_TOP); }
      res[constants.PFIELDS.GIRLS] = users;
      
      db.findPoints(GUY, function (err, users) {
        if (err) { return emitRes(err, socket, constants.IO_GET_TOP); }
        
        res[constants.PFIELDS.GUYS] = users;
        
        emitRes(null, socket, constants.IO_GET_TOP, res);
      });
    });
  });
  
};

