/**
 * Удаляем друга, сохраняем изменения в БД
 *
 * @param fid - ид друга, callback
 *
 * @return fid
 */

const dbCtrlr = require('./../../db_manager');

module.exports = function(fid, callback) {
  dbCtrlr.deleteFriends(this._pID, fid, (err) => {
    if (err) {
      return callback(err, null);
    }

    callback(null, fid);
  });
};