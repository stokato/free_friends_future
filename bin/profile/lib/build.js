var constants = require('../../io/constants');
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
 var f = constants.FIELDS;
 self.pID = id;

 if (!self.pID) { return callback(new Error("Не задан ИД"), null); }

 var fList = [f.sex, f.points, f.status, f.country, f.city, f.age, f.is_in_menu];
 self.dbManager.findUser(self.pID, null, fList, function(err, foundUser) {
   if (err) { return  callback(err, null); }
   if (!foundUser) { return callback(new Error("Такого пользователя нет в БД"), null); }

   self.pVID     = foundUser[f.vid];
   self.pStatus  = foundUser[f.status];
   self.pPoints  = foundUser[f.points];
   self.pSex     = foundUser[f.sex];
   self.pCountry = foundUser[f.country];
   self.pCity    = foundUser[f.city];
   self.pAge     = foundUser[f.age];
   self.pIsInMenu = foundUser[f.is_in_menu];

   self.pNewMessages = foundUser[f.newmessages] || 0;
   self.pNewGifts    = foundUser[f.newgifts]    || 0;
   self.pNewFriends  = foundUser[f.newfriends]  || 0;
   self.pNewGuests   = foundUser[f.newguests]   || 0;
   self.pMoney       = foundUser[f.money]       || 0;

   var info = {};
   info[f.id]       = self.pID;
   info[f.vid]      = self.pVID;
   info[f.age]      = self.pAge;
   info[f.country]  = self.pCountry;
   info[f.city]     = self.pCity;
   info[f.status]   = self.pStatus;
   info[f.points]   = self.pPoints;
   info[f.money]    = self.pMoney;
   info[f.sex]      = self.pSex;
   info[f.messages] = self.pNewMessages;
   info[f.gifts]    = self.pNewGifts;
   info[f.friends]  = self.pNewFriends;
   info[f.guests]   = self.pNewGifts;
   info[f.is_in_menu] = self.pIsInMenu;

   callback(null, info);
 });
};