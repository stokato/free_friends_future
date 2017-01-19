/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Устанавливаем количество бесплатных треков
 */

const  db = require('./../../db_manager');
const  IOF = require('./../../const_fields');

module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Количество монет задано некорректно"));
  }
  let  self = this;
  
  let  options = {
    [IOF.ID]           : self._pID,
    [IOF.VID]          : self._pVID,
    [IOF.FREE_TRACKS]  : num
  };
  
  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }
    
    self._pFreeMusic = num;
    
    callback(null, self._pFreeMusic);
  });
};

//----------------------------------------------
function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}


