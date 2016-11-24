var db = require('./../../../db_manager');

/*
 Сохраняем профиль в БД
 */
module.exports = function(callback) {
 var self = this;
 
 var options = {};
 options[db.CONST.ID]          = self._pID;
 options[db.CONST.VID]         = self._pVID;
 options[db.CONST.AGE]         = self._pAge;
 options[db.CONST.COUNTRY]     = self._pCountry;
 options[db.CONST.CITY]        = self._pCity;
 options[db.CONST.SEX]         = self._pSex;
 options[db.CONST.STATUS]      = self._pStatus;
 options[db.CONST.POINTS]      = self._pPoints;
 options[db.CONST.MONEY]       = self._pMoney;
 
 if(self._pGift1) {
  options[db.CONST.GIFT1]      = self._pGift1.gid;
 } else {
  options[db.CONST.GIFT1]      = null;
 }
 
 db.updateUser(options, function(err, id) {
  if (err) { return callback(err, null); }
  
  callback(null, id);
 });
};