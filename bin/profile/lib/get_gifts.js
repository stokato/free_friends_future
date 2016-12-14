/**
 * Получаем из БД все подарки
 *
 * @param withnew - добавлять ли признак - is_new - новые, callback
 *
 * @return gifts - объект с коллекцией пользователей,
 * (у каждого - список подарков, которые он дарил) и количеством новых
 */

var db = require('./../../db_manager');

module.exports = function(withnew, callback) {
 db.findGifts(this._pID, withnew, function(err, gifts) {
   if (err) { callback(err, null); }
   
   callback(null, gifts);
 });
};