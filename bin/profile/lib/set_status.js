var constants = require('../../constants');
/*
 Устанавливаем статус игрока
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
module.exports = function(status, callback) {
  var self = this;

  var options = {};
  options.id     = self.pID;
  options.vid    = self.pVID;
  options.status = status;

  self.pStatus = status;

  self.dbManager.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self.pStatus = status;
    callback(null, self.pStatus);
  });
};