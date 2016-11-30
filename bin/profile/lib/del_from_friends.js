/**
 * Удаляем друга, сохраняем изменения в БД
 *
 * @param fid - ид друга, callback
 *
 * @return fid
 */

var db = require('./../../db_manager');

module.exports = function(fid, callback) {
  var self = this;
  db.deleteFriends(self._pID, fid, function (err) {
    if (err) { return callback(err, null); }

    callback(null, fid);
  });
};