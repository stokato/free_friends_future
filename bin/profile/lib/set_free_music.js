/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Устанавливаем количество бесплатных треков
 */

var db = require('./../../db_manager');
var IOF = require('./../../constants').PFIELDS;

module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Количество монет задано некорректно"));
  }
  var self = this;
  
  var options = {};
  options[IOF.ID]           = self._pID;
  options[IOF.VID]          = self._pVID;
  options[IOF.FREE_TRACKS]  = num;
  
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


