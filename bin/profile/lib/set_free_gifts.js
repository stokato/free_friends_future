/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Устанавливаем количество бесплатных подарков
 */

var db = require('./../../db_manager');
var IOF = require('./../../constants').PFIELDS;

module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Количество подарков задано некорректно"));
  }
  var self = this;
  
  var options = {};
  options[IOF.ID]    = self._pID;
  options[IOF.VID]   = self._pVID;
  options[IOF.FREE_GIFTS] = num;
  
  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }
    
    self._pFreeGifts = num;
    
    callback(null, self._pFreeGifts);
  });
};

//----------------------------------------------
function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}
