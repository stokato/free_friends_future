var db = require('./../../../db_manager');

/*
    Получаем деньги
 */
module.exports = function(callback) {
  var self = this;

  var fList = [db.CONST.MONEY];
  db.findUser(self._pID, null, fList, function(err, foundUser) {
    if (err) { return cb(err); }
    
    if (!foundUser) {
      callback(new Error("Нет такого ползователя в базе данных"));
    } else {
      self._pMoney  = foundUser[db.CONST.MONEY];

      callback(null, self._pMoney);
    }
  });
};