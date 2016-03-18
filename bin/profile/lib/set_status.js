var constants = require('../../io/constants');
/*
 Устанавливаем статус игрока
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
module.exports = function(status, callback) {
  var self = this;
  var f = constants.FIELDS;

  var options = {};
  options[f.id]     = self.pID;
  options[f.vid]    = self.pVID;
  options[f.status] = status;

  self.dbManager.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self.pStatus = status;
    callback(null, self.pStatus);
  });
};