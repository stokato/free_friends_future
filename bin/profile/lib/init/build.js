var constants = require('../../../constants'),
    IOF = constants.PFIELDS;
var db = require('./../../../db_manager');

/*
    Инициализируем профиль
 */
module.exports = function(id, callback) {
 var self = this;

 self._pID = id;

 if (!self._pID) { return callback(new Error("Не задан ИД"), null); }

 var fList = [
   IOF.VID,
   IOF.SEX,
   IOF.POINTS,
   IOF.STATUS,
   IOF.COUNTRY,
   IOF.CITY,
   IOF.BDATE,
   IOF.ISMENU,
   IOF.GIFT1
 ];
  
 db.findUser(self._pID, null, fList, function(err, foundUser) {
   if (err) { return  callback(err, null); }
   if (!foundUser) { return callback(new Error("Такого пользователя нет в БД"), null); }

   self._pVID           = foundUser[IOF.VID];
   self._pStatus        = foundUser[IOF.STATUS];
   self._pPoints        = foundUser[IOF.POINTS];
   self._pSex           = foundUser[IOF.SEX];
   self._pCountry       = foundUser[IOF.COUNTRY];
   self._pCity          = foundUser[IOF.CITY];
   self._pBDate         = foundUser[IOF.BDATE];
   self._pIsInMenu      = foundUser[IOF.ISMENU];
  
   self._pMoney         = foundUser[IOF.MONEY]      || 0;
   
   var info = {};
   info[IOF.ID]       = self._pID;
   info[IOF.VID]      = self._pVID;
   info[IOF.AGE]      = self.getAge();
   info[IOF.SEX]      = self._pSex;
   info[IOF.MONEY]    = self._pMoney;
   info[IOF.POINTS]   = self._pPoints;
   info[IOF.STATUS]   = self._pStatus;
   info[IOF.CITY]     = self._pCity;
   info[IOF.COUNTRY]  = self._pCountry;

   if(foundUser[IOF.GIFT1]) {
     db.findGift(foundUser[IOF.GIFT1], function(err, gift) {
       if (err) { return  callback(err, null); }

       self._pGift1 = gift || null;
       info[IOF.GIFT1] = self._pGift1;

       callback(null, self._pID);
     });
   } else {
     callback(null, self._pID);
   }
 });
};
