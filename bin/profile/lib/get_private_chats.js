/**
 * Возвращаем историю чатов
 *
 * @param callback
 * @return chats - список чатов
 */

var db = require('./../../db_manager');

module.exports = function(callback) {
 var self = this;
  
 db.findChats(self._pID, function(err, chats) {
   if (err) { return callback(err, null); }

   callback(null, chats);
 });
};