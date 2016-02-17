/*
 Получаем историю сообщений:
 - Читаем из БД
 - Если задан параметр count - указанное количество с конца
 - Если задан position - count с указанной позиции
 */
module.exports = function(options, callback) {
  var self = this;
  var message = {
    id : options.id,
    companionid : options.companionid,
    opened : true
  };

  self.dbManager.updateMessage(this.pID, message, function(err) {
    if (err) { return callback(err, null); }

    self.pNewMessages--;

    callback(null, null);
  });
};