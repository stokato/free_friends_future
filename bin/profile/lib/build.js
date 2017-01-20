/**
 * Инициализируем профиль для внутренних операций
 *
 * Ищем прфиль по его ид *
 * @param String id - ид пользователя
 *
 * @return id
 */

const dbCtrlr = require('./../../db_manager');
const PF      = require('../../const_fields');

module.exports = function(id, callback) {
 let  self = this;

 self._pID = id;

 if (!self._pID) {
   return callback(new Error("Не задан ИД"), null);
 }

 let  fList = [
   PF.VID,
   PF.SEX,
   PF.POINTS,
   PF.STATUS,
   PF.COUNTRY,
   PF.CITY,
   PF.BDATE,
   PF.ISMENU,
   PF.GIFT1
 ];
  
 dbCtrlr.findUser(self._pID, null, fList, (err, foundUserObj) => {
   if (err) {
     return  callback(err, null);
   }
   
   if (!foundUserObj) {
     return callback(new Error("Такого пользователя нет в БД"), null);
   }

   self._pVID       = foundUserObj[PF.VID];
   self._pStatus    = foundUserObj[PF.STATUS];
   self._pPoints    = foundUserObj[PF.POINTS];
   self._pSex       = foundUserObj[PF.SEX];
   self._pCountry   = foundUserObj[PF.COUNTRY];
   self._pCity      = foundUserObj[PF.CITY];
   self._pBDate     = foundUserObj[PF.BDATE];
   self._pIsInMenu  = foundUserObj[PF.ISMENU];
   self._pMoney     = foundUserObj[PF.MONEY]   || 0;
   
   callback(null, self._pID);
   
 });
};
