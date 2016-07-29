var constants = require('../../io/constants');
/*
 Устанавливаем количество монет игрока
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Ошибка при установке количества монет, количество монет задано некорректно"));
  }
  var self = this;

  //var f = constants.FIELDS;

  var options = {};
  options.id = self.pID;
  options.vid = self.pVID;
  options.money = num;

  self.dbManager.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self.pMoney = num;
    callback(null, self.pMoney);
  });
};

function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}