/**
 * Удаляем друга, сохраняем изменения в БД
 *
 * @param fid - ид друга, callback
 *
 * @return fid
 */

const db = require('./../../db_manager');

module.exports = function(fid, callback) {
  db.deleteFriends(this._pID, fid, function (err) {
    if (err) { return callback(err, null); }

    callback(null, fid);
  });
};