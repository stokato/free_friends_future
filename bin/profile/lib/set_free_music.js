/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Устанавливаем количество бесплатных треков
 */

const  dbCtrlr = require('./../../db_controller');
const  PF      = require('./../../const_fields');

module.exports = function(num, callback) {
  if (!Number.isInteger(num)) {
    return callback(new Error("Количество монет задано некорректно"));
  }
  let  self = this;
  
  let  options = {
    [PF.ID]           : self._pID,
    [PF.VID]          : self._pVID,
    [PF.FREE_TRACKS]  : num
  };
  
  dbCtrlr.updateUser(options, (err) => {
    if (err) {
      return callback(err, null);
    }
    
    self._pFreeMusic = num;
    
    callback(null, self._pFreeMusic);
  });
};

