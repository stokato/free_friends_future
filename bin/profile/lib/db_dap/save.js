var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
 Сохраняем профиль в БД
 */
module.exports = function(callback) {
 var self = this;
 
 var options = {};
 options[IOF.ID]          = self._pID;
 options[IOF.VID]         = self._pVID;
 options[IOF.AGE]         = self._pAge;
 options[IOF.COUNTRY]     = self._pCountry;
 options[IOF.CITY]        = self._pCity;
 options[IOF.SEX]         = self._pSex;
 options[IOF.STATUS]      = self._pStatus;
 options[IOF.POINTS]      = self._pPoints;
 options[IOF.MONEY]       = self._pMoney;
 
 if(self._pGift1) {
  options[IOF.GIFT1]      = self._pGift1.gid;
 } else {
  options[IOF.GIFT1]      = null;
 }
 
 db.updateUser(options, function(err, id) {
  if (err) { return callback(err, null); }
  
  callback(null, id);
 });
};