var db = require('./../../../db_manager');

/*
    Получаем гостей из БД
 */
module.exports = function(isSelf, callback) {
 var self = this;
 db.findGuests(self._pID, isSelf, function(err, guests) {
   if (err) { return callback(err, null); }

   callback(null, guests);
 });
};