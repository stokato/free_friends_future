/**
 * Получаем топ игроков
 *
 * @param socket, options, callback
 * @return {Object} - объект с общим топом, топом парней и девушек
 */

const dbCtrlr   = require('./../../../db_manager');
const PF        = require('./../../../const_fields');
const emitRes   = require('./../../../emit_result');
const Config    = require('./../../../../config.json');

module.exports = function (socket, options) {
  
  const GUY         = Config.user.constants.sex.male;
  const GIRL        = Config.user.constants.sex.female;
  const IO_GET_TOP  = Config.io.emits;
  
  let res = {};
  dbCtrlr.findPoints(null, (err, users) => {
    if (err) {
      return emitRes(err, socket, IO_GET_TOP);
    }
    
    res[PF.ALL] = users;
    
    dbCtrlr.findPoints(GIRL, (err, users) => {
      if (err) {
        return emitRes(err, socket, IO_GET_TOP);
      }
      
      res[PF.GIRLS] = users;
      
      dbCtrlr.findPoints(GUY, (err, users) => {
        if (err) {
          return emitRes(err, socket, IO_GET_TOP);
        }
        
        res[PF.GUYS] = users;
        
        emitRes(null, socket, IO_GET_TOP, res);
      });
    });
  });
  
};

