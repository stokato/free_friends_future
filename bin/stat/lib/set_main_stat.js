/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Накопление общей статистики
 *
 */

var db        = require('./../../db_manager');
var PF = require('./../../constants').PFIELDS;
var logError = require('./stat_error');

module.exports = function (field, val) {
  
  if(!this._isNumeric(val)) {
    return logError(field, 'value is not a number')
  }
  
  var params = {};
  params[PF.ID] = 'main';
  params[field] = val;
  
  db.updateMainStat(params, function (err) {
    if(err) {
      logError(field, err.message) ;
    }
  })
};