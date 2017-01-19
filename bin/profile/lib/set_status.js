/**
 * Устанавливаем статус игрока
 *
 * @param status - новый статус, callback
 * @return status
 */

const  db = require('./../../db_manager');
const  IOF = require('./../../const_fields');

module.exports = function(status, callback) {
  let  self = this;

  let  options = {
    [IOF.ID]     : self._pID,
    [IOF.VID]    : self._pVID,
    [IOF.STATUS] : status
  };

  self._pStatus = status;

  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pStatus = status;
    
    callback(null, self._pStatus);
  });
};