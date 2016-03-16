var constants = require('../../io/constants');
/*
 Получаем деньги
 */
module.exports = function(callback) {
  var self = this;
  var f = constants.FIELDS;

  var fList = [f.money];
  self.dbManager.findUser(self.pID, null, fList, function(err, foundUser) {
    if (err) { return cb(err); }
    if (!foundUser) {
      callback(new Error("Нет такого ползователя в базе данных"));
    } else {
      self.pMoney  = foundUser[f.money];

      callback(null, foundUser[f.money]);
    }
  });
};