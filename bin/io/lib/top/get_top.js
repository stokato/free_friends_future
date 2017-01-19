/**
 * Получаем топ игроков
 *
 * @param socket, options, callback
 * @return {Object} - объект с общим топом, топом парней и девушек
 */

const db         = require('./../../../db_manager');
const emitRes    = require('./../../../emit_result');
const Config    = require('./../../../../config.json');

const GUY = Config.user.constants.sex.male;
const GIRL = Config.user.constants.sex.female;
const IO_GET_TOP = Config.io.emits;
const PF = require('./../../../const_fields');

module.exports = function (socket, options) {
  
  let res = {};
  db.findPoints(null, function (err, users) {
    if (err) { return emitRes(err, socket, IO_GET_TOP); }
    res[PF.ALL] = users;
    
    db.findPoints(GIRL, function (err, users) {
      if (err) { return emitRes(err, socket, IO_GET_TOP); }
      res[PF.GIRLS] = users;
      
      db.findPoints(GUY, function (err, users) {
        if (err) { return emitRes(err, socket, IO_GET_TOP); }
        
        res[PF.GUYS] = users;
        
        emitRes(null, socket, IO_GET_TOP, res);
      });
    });
  });
  
};

