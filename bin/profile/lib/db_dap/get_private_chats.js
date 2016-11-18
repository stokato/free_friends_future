var db = require('./../../../db_manager');

/*
  Возвращаем историю чатов
 */
module.exports = function(callback) {
 var self = this;
  
 db.findChats(self._pID, function(err, chats) {
   if (err) { return callback(err, null); }

   callback(null, chats);
 });
};