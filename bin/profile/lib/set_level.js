/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Увеличиваем уровень игрока
 */

const  db        = require('./../../db_manager');
const  IOF       = require('./../../constants').PFIELDS;

module.exports = function(num, callback) {
  let  self = this;
  
  self._pLevel = self._pLevel || 0;
  
  let  options = {
    [IOF.ID]      : self._pID,
    [IOF.VID]     : self._pVID,
    [IOF.SEX]     : self._pSex,
    [IOF.LEVEL]   : num
  };
  
  db.updateUser(options, function(err) {
    if(err) { return callback(err, null); }
  
    self._pLevel = num;
    
    callback(null, self._pLevel);
  });
  
};
