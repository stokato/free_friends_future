/**
 * Устанавливаем статус игрока
 *
 * @param status - новый статус, callback
 * @return status
 */

const  dbCtrlr  = require('./../../db_manager');
const  PF       = require('./../../const_fields');

module.exports = function(status, callback) {
  let  self = this;

  let  options = {
    [PF.ID]     : self._pID,
    [PF.VID]    : self._pVID,
    [PF.STATUS] : status
  };

  self._pStatus = status;

  dbCtrlr.updateUser(options, (err) => {
    if (err) {
      return callback(err, null);
    }

    self._pStatus = status;
    
    callback(null, self._pStatus);
  });
};