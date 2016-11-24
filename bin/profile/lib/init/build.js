var constants = require('../../../constants');
var db = require('./../../../db_manager');

/*
    Инициализируем профиль
 */
module.exports = function(id, callback) {
 var self = this;

 self._pID = id;

 if (!self._pID) { return callback(new Error("Не задан ИД"), null); }

 var fList = [
   db.CONST.SEX,
   db.CONST.POINTS,
   db.CONST.STATUS,
   db.CONST.COUNTRY,
   db.CONST.CITY,
   db.CONST.AGE,
   db.CONST.ISMENU,
   db.CONST.GIFT1
 ];
  
 db.findUser(self._pID, null, fList, function(err, foundUser) {
   if (err) { return  callback(err, null); }
   if (!foundUser) { return callback(new Error("Такого пользователя нет в БД"), null); }

   self._pVID           = foundUser[db.CONST.VID];
   self._pStatus        = foundUser[db.CONST.STATUS];
   self._pPoints        = foundUser[db.CONST.POINTS];
   self._pSex           = foundUser[db.CONST.SEX];
   self._pCountry       = foundUser[db.CONST.COUNTRY];
   self._pCity          = foundUser[db.CONST.CITY];
   self._pAge           = foundUser[db.CONST.AGE];
   self._pIsInMenu      = foundUser[db.CONST.ISMENU];
  
   self._pMoney         = foundUser[db.CONST.MONEY]      || 0;

   if(foundUser[db.CONST.GIFT1]) {
     db.findGift(foundUser[db.CONST.GIFT1], function(err, gift) {
       if (err) { return  callback(err, null); }

       self._pGift1 = gift || null;

       callback(null, self._pID);
     });
   } else {
     callback(null, self._pID);
   }
 });
};
