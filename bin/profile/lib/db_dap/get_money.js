var db = require('./../../../db_manager');

/*
 Получаем деньги
 */
module.exports = function(callback) {
  var self = this;
  //var f = constants.FIELDS;

  var fList = ["money"];
  db.findUser(self.pID, null, fList, function(err, foundUser) {
    if (err) { return cb(err); }
    if (!foundUser) {
      callback(new Error("Нет такого ползователя в базе данных"));
    } else {
      self.pMoney  = foundUser.money;

      callback(null, foundUser.money);
    }
  });
};