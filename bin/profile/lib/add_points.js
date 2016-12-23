/**
 * Добавляем очки пользователю
 *
 * Сохраняем обновленные данные в БД
 */

var db        = require('./../../db_manager');
var IOF       = require('./../../constants').PFIELDS;

module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Количество очков задано некорректно"));
  }
  var self = this;
  
  self._pPoints = self._pPoints || 0;
  
  var options = {};
  options[IOF.ID]      = self._pID;
  options[IOF.VID]     = self._pVID;
  options[IOF.SEX]     = self._pSex;
  options[IOF.POINTS]  = self._pPoints + num;
  
  db.addPoints(options, function(err) {
    if(err) { return callback(err, null); }
    
    self._pPoints += num;
    
    if(self._pOnAddPoints) {
      self._pOnAddPoints(self);
    }
    
    callback(null, self._pPoints);
  });
  
};

//-------------------------------
function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}