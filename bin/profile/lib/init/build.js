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

   self._pIsNewMessages = foundUser[db.CONST.ISMESSAGES] || 0;
   self._pIsNewGifts    = foundUser[db.CONST.ISGIFTS]    || 0;
   self._pIsNewFriends  = foundUser[db.CONST.ISFRIENDS]  || 0;
   self._pIsNewGuests   = foundUser[db.CONST.ISGUESTS]   || 0;
  
   self._pMoney         = foundUser[db.CONST.MONEY]      || 0;

   if(foundUser[db.CONST.GIFT1]) {
     db.findGift(foundUser[db.CONST.GIFT1], function(err, gift) {
       if (err) { return  callback(err, null); }

       self._pGift1 = gift || null;

       var info = pullInfo(self);

       callback(null, info);
     });
   } else {
     var info = pullInfo(self);
     callback(null, info);
   }
 });
};

function pullInfo(profile) {

  return {
    id       : profile._pID,
    vid      : profile._pVID,
    age      : profile._pAge,
    country  : profile._pCountry,
    city     : profile._pCity,
    status   : profile._pStatus,
    points   : profile._pPoints,
    money    : profile._pMoney,
    sex      : profile._pSex,
    messages : profile._pIsNewMessages,
    gifts    : profile._pIsNewGifts,
    friends  : profile._pIsNewFriends,
    guests   : profile._pIsNewGifts,
    ismenu   : profile._pIsInMenu,
    gift1    : profile._pGift1
  };
}