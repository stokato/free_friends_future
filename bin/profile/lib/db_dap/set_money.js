var db = require('./../../../db_manager');

/*
  Устанавливаем количество монет игрока
 */
module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Количество монет задано некорректно"));
  }
  var self = this;

  var options = {};
  options[db.CONST.ID]    = self._pID;
  options[db.CONST.VID]   = self._pVID;
  options[db.CONST.MONEY] = num;

  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pMoney = num;
    
    callback(null, self._pMoney);
  });
};

function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}