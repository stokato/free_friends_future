/**
 * Получаем баланс пользователя
 * Сохраняем в свойство профиля
 *
 * @param callback
 * @return money - количество монет у пользоателя
 */

const db = require('./../../db_manager');
const PF = require('./../../const_fields');

/*
    Получаем деньги
 */
module.exports = function(callback) {
  let self = this;

  let fList = [PF.MONEY];
  db.findUser(self._pID, null, fList, (err, foundUser) => {
    if (err) {
      return callback(err);
    }
    
    if (!foundUser) {
      callback(new Error("Нет такого ползователя в базе данных"));
    } else {
      self._pMoney  = Number(foundUser[PF.MONEY]);

      callback(null, self._pMoney);
    }
  });
};