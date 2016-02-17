/*
 Устанавливаем статус игрока
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
module.exports = function(str, callback) {
  var self = this;
  var options = {
    id     : self.pID,
    vid    : self.pVID,
    status : str
  };

  self.dbManager.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self.pStatus = options.status;
    callback(null, self.pStatus);
  });
};