/*
 Сохраняем личное сообщение в БД
 - Сообщение должно иметь поля: собеседник, входящее/bool, текст, дата
 */
module.exports = function(message, callback) {
 var self = this;
 self.dbManager.addMessage(self.pID, message, function(err) {
   if (err) { return callback(err, null); }

   if (!self.isPrivateChat(message.companionid)) self.pNewMessages ++;
   self.save(function(err) {
   if (err) { return callback(err, null); }

   callback(null, null);
   });
 });
};