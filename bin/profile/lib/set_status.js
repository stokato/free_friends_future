/**
 * Устанавливаем статус игрока
 *
 * @param status - новый статус, callback
 * @return status
 */

var db = require('./../../db_manager');
var IOF = require('./../../constants').PFIELDS;

module.exports = function(status, callback) {
  var self = this;

  var options = {};
  options[IOF.ID]     = self._pID;
  options[IOF.VID]    = self._pVID;
  options[IOF.STATUS] = status;

  self._pStatus = status;

  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pStatus = status;
    
    callback(null, self._pStatus);
  });
};