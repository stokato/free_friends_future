/**
 * Инициализируем профиль для внутренних операций
 *
 * Ищем прфиль по его ид *
 * @param String id - ид пользователя
 *
 * @return id
 */

const  constants = require('../../constants'),
    IOF       = constants.PFIELDS,
    db        = require('./../../db_manager');

module.exports = function(id, callback) {
 let  self = this;

 self._pID = id;

 if (!self._pID) { return callback(new Error("Не задан ИД"), null); }

 let  fList = [
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

   self._pVID       = foundUser[IOF.VID];
   self._pStatus    = foundUser[IOF.STATUS];
   self._pPoints    = foundUser[IOF.POINTS];
   self._pSex       = foundUser[IOF.SEX];
   self._pCountry   = foundUser[IOF.COUNTRY];
   self._pCity      = foundUser[IOF.CITY];
   self._pBDate     = foundUser[IOF.BDATE];
   self._pIsInMenu  = foundUser[IOF.ISMENU];
  
   self._pMoney     = foundUser[IOF.MONEY]      || 0;
   
   let  info = {
    [IOF.ID]       : self._pID,
    [IOF.VID]      : self._pVID,
    [IOF.AGE]      : self.getAge(),
    [IOF.SEX]      : self._pSex,
    [IOF.MONEY]    : self._pMoney,
    [IOF.POINTS]   : self._pPoints,
    [IOF.STATUS]   : self._pStatus,
    [IOF.CITY]     : self._pCity,
    [IOF.COUNTRY]  : self._pCountry
   };


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
