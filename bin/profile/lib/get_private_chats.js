var db = require('./../../db_manager');

/*
 Получаем историю чатов:
 - Читаем из БД
 - Возвращаем массив чатов
 */
module.exports = function(callback) {
 var self = this;
 db.findChats(self.pID, function(err, chats) {
   if (err) { return callback(err, null); }

   callback(null, chats);
 });
};