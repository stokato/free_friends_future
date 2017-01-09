/**
 * Сохраняем профиль в БД
 */

const db  = require('./../../db_manager');
const IOF = require('./../../constants').PFIELDS;

module.exports = function(callback) {
  let self = this;
  
  let options = {
    [IOF.ID]       : self._pID,
    [IOF.VID]      : self._pVID,
    [IOF.BDATE]    : self._pBDate,
    [IOF.COUNTRY]  : self._pCountry,
    [IOF.CITY]     : self._pCity,
    [IOF.SEX]      : self._pSex,
    [IOF.STATUS]   : self._pStatus,
    [IOF.POINTS]   : self._pPoints,
    [IOF.MONEY]    : self._pMoney
  };
  
  if(self._pGift1) {
    options[IOF.GIFT1]    = self._pGift1.gid;
  } else {
    options[IOF.GIFT1]    = null;
  }
  
  db.updateUser(options, function(err, id) {
    if (err) { return callback(err, null); }
    
    callback(null, id);
  });
};