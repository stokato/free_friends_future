/**
 * Получаем список всех друзей из БД *
 *
 * @param withnew - получать ли с признаком is_new - новые, callback
 * @return friends - объект с коллекцией друзей и количеством новых
 */

const db = require('./../../db_manager');

module.exports = function(isWithNew, callback) {
 db.findFriends(this._pID, null, isWithNew, (err, friends) => {
   if (err) {
     return callback(err, null);
   }
   
   callback(null, friends);
 });
};