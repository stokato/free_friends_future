/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Увеличиваем уровень игрока
 */

var db        = require('./../../db_manager');
var IOF       = require('./../../constants').PFIELDS;

module.exports = function(num, callback) {
  var self = this;
  
  self._pLevel = self._pLevel || 0;
  
  var options = {};
  options[IOF.ID]      = self._pID;
  options[IOF.VID]     = self._pVID;
  options[IOF.SEX]     = self._pSex;
  options[IOF.LEVEL]   = num;
  
  db.updateUser(options, function(err) {
    if(err) { return callback(err, null); }
  
    self._pLevel = num;
    
    callback(null, self._pLevel);
  });
  
};
