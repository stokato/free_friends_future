/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Накопление общей статистики
 *
 */

var db        = require('./../../db_manager');
var PF = require('./../../constants').PFIELDS;
var logError = require('./stat_error');

module.exports = function (filed, val) {
  
  if(!this._isNumeric(val)) {
    return logError(filed, 'value is not a number')
  }
  
  var params = {};
  params[PF.ID] = 'main';
  params[filed] = val;
  
  db.updateMainStat(params, function (err) {
    if(err) {
      logError(filed, err.message) ;
    }
  })
};