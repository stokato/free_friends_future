/**
 * Добавляем очки пользователю
 *
 * Сохраняем обновленные данные в БД
 */

const  db        = require('./../../db_manager');
const  IOF       = require('./../../constants').PFIELDS;

module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Количество очков задано некорректно"));
  }
  let  self = this;
  
  self._pPoints = self._pPoints || 0;
  
  let  options = {
    [IOF.ID]      : self._pID,
    [IOF.VID]     : self._pVID,
    [IOF.SEX]     : self._pSex,
    [IOF.POINTS]  : self._pPoints + num
  };
  
  db.addPoints(options, function(err) {
    if(err) { return callback(err, null); }
    
    self._pPoints += num;
    
    if(self._pOnAddPoints) {
      self._pOnAddPoints(self, num);
    }
    
    callback(null, self._pPoints);
  });
  
};

//-------------------------------
function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}