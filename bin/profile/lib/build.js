var constants = require('../../constants');
/*
 Инициализируем профиль
 - Устанавливаем полученные из соц сети свойства (в БД они точно не нужны, а в ОЗУ ???)
 - Что-то проверяем
 - Ищем пользователя в БД и заполняем оставшиеся свойства
 - Если нет - добавляем
 - Возвращаем свойсва
 */
module.exports = function(id, callback) {
 var self = this;
 //var f = constants.FIELDS;
 self.pID = id;

 if (!self.pID) { return callback(new Error("Не задан ИД"), null); }

 var fList = ["sex", "points", "status", "country", "city", "age", "ismenu", "gift1"];
 self.dbManager.findUser(self.pID, null, fList, function(err, foundUser) {
   if (err) { return  callback(err, null); }
   if (!foundUser) { return callback(new Error("Такого пользователя нет в БД"), null); }

   self.pVID     = foundUser.vid;
   self.pStatus  = foundUser.status;
   self.pPoints  = foundUser.points;
   self.pSex     = foundUser.sex;
   self.pCountry = foundUser.country;
   self.pCity    = foundUser.city;
   self.pAge     = foundUser.age;
   self.pIsInMenu = foundUser.ismenu;

   self.pNewMessages = foundUser.newmessages || 0;
   self.pNewGifts    = foundUser.newgifts    || 0;
   self.pNewFriends  = foundUser.newfriends  || 0;
   self.pNewGuests   = foundUser.newguests   || 0;
   self.pMoney       = foundUser.money       || 0;

   if(foundUser.gift1) {
     self.dbManager.findGift(foundUser.gift1, function(err, gift) {
       if (err) { return  callback(err, null); }

       self.pGift1 = gift || null;

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
  //var f = constants.FIELDS;
  var info = {};
  info.id       = profile.pID;
  info.vid      = profile.pVID;
  info.age      = profile.pAge;
  info.country  = profile.pCountry;
  info.city     = profile.pCity;
  info.status   = profile.pStatus;
  info.points   = profile.pPoints;
  info.money    = profile.pMoney;
  info.sex      = profile.pSex;
  info.messages = profile.pNewMessages;
  info.gifts    = profile.pNewGifts;
  info.friends  = profile.pNewFriends;
  info.guests   = profile.pNewGifts;
  info.ismenu   = profile.pIsInMenu;
  info.gift1    = profile.pGift1;

  return info;
}