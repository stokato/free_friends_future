/**
 * Получаем баланс пользователя
 * Сохраняем в свойство профиля
 *
 * @param callback
 * @return money - количество монет у пользоателя
 */

var db = require('./../../db_manager');
var constants = require('./../../constants');

/*
    Получаем деньги
 */
module.exports = function(callback) {
  var self = this;

  var fList = [db.CONST.MONEY];
  db.findUser(self._pID, null, fList, function(err, foundUser) {
    if (err) { return callback(err); }
    
    if (!foundUser) {
      callback(new Error("Нет такого ползователя в базе данных"));
    } else {
      self._pMoney  = Number(foundUser[constants.PFIELDS.MONEY]);

      callback(null, self._pMoney);
    }
  });
};