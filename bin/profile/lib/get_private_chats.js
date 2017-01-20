/**
 * Возвращаем историю чатов
 *
 * @param callback
 * @return chats - список чатов
 */

const db = require('./../../db_manager');

module.exports = function(callback) {
 db.findChats(this._pID, (err, chats) => {
   if (err) {
     return callback(err, null);
   }

   callback(null, chats);
 });
};