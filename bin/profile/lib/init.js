var async     = require('async');
var Config = require('./../../../config.json').user;
var constants = require('../../io/constants');
/*
 Инициализируем профиль
 - Устанавливаем полученные из соц сети свойства (в БД они точно не нужны, а в ОЗУ ???)
 - Что-то проверяем
 - Ищем пользователя в БД и заполняем оставшиеся свойства
 - Если нет - добавляем
 - Возвращаем свойсва
 */
module.exports = function(socket, options, callback) {
  var self = this;
  var f = constants.FIELDS;

  async.waterfall([//////////////////////////////////////////////////////////////////////////
    function (cb) {  // Устанавливаем свойства
      self.pSocket   = socket;
      self.pVID      = options[f.vid];
      self.pBDate    = new Date(options[f.bdate]);
      self.pAge      = new Date().getFullYear() - self.pBDate.getFullYear();
      self.pCountry  = options[f.country];
      self.pCity     = options[f.city];
      self.pSex      = options[f.sex];

      if (!self.pSocket) { return cb(new Error("Не задан Socket Id"), null); }
      if (!self.pVID ||  !self.pAge || !self.pCountry || !self.pCity || !self.pSex) {
        return cb(new Error("На задана одна из опций"), null);
      }

      cb(null, null);
    },
    function (res, cb) {  // Ищем пользователя в базе
      var fList = [f.sex, f.points, f.money, f.age, f.country, f.city, f.status];
      self.dbManager.findUser(null, self.pVID, fList, function(err, foundUser) {
        if (err) { return cb(err); }
        if (foundUser) {
          self.pID     = foundUser[f.id];
          self.pStatus = foundUser[f.status];
          self.pPoints = foundUser[f.points];
          self.pMoney  = foundUser[f.money];

          self.pAge     = (self.pAge)     ? self.pAge     : foundUser[f.age];
          self.pSex     = (self.pSex)     ? self.pSex     : foundUser[f.sex];
          self.pCountry = (self.pCountry) ? self.pCountry : foundUser[f.country];
          self.pCity    = (self.pCity)    ? self.pCity    : foundUser[f.city];

          self.pNewMessages = foundUser.newmessages || 0;
          self.pNewGifts    = foundUser.newgifts    || 0;
          self.pNewFriends  = foundUser.newfriends  || 0;
          self.pNewGuests   = foundUser.newguests   || 0;
        }
        cb(null, foundUser);
      });
    },////////////////////////////////////////////////////////////////////////
    function (foundUser, cb) {  // Если изменились нужные  поля, обмновляем их в базе
      if(foundUser) {
        if(self.pSex    != foundUser[f.sex]     || self.pAge  != foundUser[f.age]  ||
          self.pCountry != foundUser[f.country] || self.pCity != foundUser[f.city] ||
          self.pStatus  != foundUser[f.status]) {

          self.save(function(err) {
            if (err) { return cb(err); }

            cb(null, foundUser);
          });
        } else cb(null, foundUser);
      } else cb(null, foundUser);
    },
    ////////////////////////////////////////////////////////////////////////////
    function (foundUser, cb) { // Если в базе такого нет, добавляем
      if (!foundUser) {
        // Добавляем пользователя

        var newUser = {};
        newUser[f.vid]      = self.pVID;
        newUser[f.age]      = self.pAge;
        newUser[f.country]  = self.pCountry;
        newUser[f.city]     = self.pCity;
        newUser[f.sex]      = self.pSex;
        newUser[f.money]    = self.pMoney = Config.settings.start_money;

        self.dbManager.addUser(newUser, function(err, user) {
          if (err) { return cb(err); }

          self.pID = user[f.id];

          cb(null, null);
        });
      } else cb(null, null);
    }
    //////////////////////////////////////////////////////////////////////////////////
  ], function (err) { // Вызвается последней или в случае ошибки
    if (err) { return  callback(err); }

    var info = {};
    info[f.id]          = self.pID;
    info[f.vid]         = self.pVID;
    info[f.status]      = self.pStatus;
    info[f.points]      = self.pPoints;
    info[f.money]       = self.pMoney;
    info[f.sex]         = self.pSex;
    info[f.age]         = self.pAge;
    info[f.city]        = self.pCity;
    info[f.country]     = self.pCountry;
    info[f.newmessages] = self.pNewMessages;
    info[f.newgifts]    = self.pNewGifts;
    info[f.newfriends]  = self.pNewFriends;
    info[f.newguests]   = self.pNewGifts;

    callback(null, info);
  }); // waterfall

};
