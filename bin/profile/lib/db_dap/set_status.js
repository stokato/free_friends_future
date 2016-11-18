var db = require('./../../../db_manager');

/*
    Устанавливаем статус игрока
 */
module.exports = function(status, callback) {
  var self = this;

  var options = {};
  options[db.CONST.ID]     = self._pID;
  options[db.CONST.VID]    = self._pVID;
  options[db.CONST.STATUS] = status;

  self._pStatus = status;

  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pStatus = status;
    
    callback(null, self._pStatus);
  });
};