var db        = require('./../../../db_manager');

/*
    Добавляем очки пользователю
 */
module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Количество очков задано некорректно"));
  }
  var self = this;
  
  self._pPoints = self._pPoints || 0;
  
  var options = {};
  options[db.CONST.USERID]  = self._pID;
  options[db.CONST.USERVID] = self._pVID;
  options[db.CONST.SEX]     = self._pSex;
  options[db.CONST.POINTS]  = self._pPoints + num;
  
  db.addPoints(options, function(err) {
    if(err) { return callback(err, null); }
    
    self._pPoints += num;
    
    callback(null, self._pPoints);
  });
  
};

function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}