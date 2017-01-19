/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Накопление статистики пользователя
 *
 */

const logError  = require('./stat_error');
const db        = require('./../../db_manager');
const PF        = require('./../../const_fields');

module.exports = function (id, vid, field, val) {
  
  if(!this._isNumeric(val)) {
    return logError(field, 'value is not a number') ;
  }
  
  let params = {
    [PF.ID]   : id,
    [PF.VID]  : vid,
    [field]   : val
  };

  
  db.updateUserStat(params, function (err) {
    if(err) { logError(field, err.message) ; }
  })
};