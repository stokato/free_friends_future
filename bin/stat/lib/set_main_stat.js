/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Накопление общей статистики
 *
 */

const logError  = require('./stat_error');
const db        = require('./../../db_controller');
const PF        = require('./../../const_fields');

module.exports = function (field, val) {
  
  if(!this._isNumeric(val)) {
    return logError(field, 'value is not a number')
  }
  
  let params = {
    [PF.ID] : 'main',
    [field] : val
  };

  
  db.updateMainStat(params, function (err) {
    if(err) {
      logError(field, err.message) ;
    }
  })
};