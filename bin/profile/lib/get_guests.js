/**
 * Получаем гостей из БД
 *
 * @param withnew - добавлять ли признак is_new - новый\
 *
 * @return guests - объект с коллекцией гостей и количеством новых
 */

const db = require('./../../db_manager');

module.exports = function(isSelf, callback) {
 db.findGuests(this._pID, isSelf, function(err, guests) {
   if (err) { return callback(err, null); }

   callback(null, guests);
 });
};