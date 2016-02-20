/*
 Получаем историю сообщений:
 - Читаем из БД
 - Если задан параметр count - указанное количество с конца
 - Если задан position - count с указанной позиции
 */
module.exports = function(date, callback) {
 var self = this;
 self.dbManager.findAllMessages(self.pID,  { date : date }, function(err, messages) {
   if (err) { return callback(err, null); }

   self.pNewMesages = 0;
   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, messages);
   });
   callback(null, messages);
 });
};