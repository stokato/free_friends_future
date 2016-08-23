var async     = require('async');
var Config = require('./../../../config.json').user;
var constants = require('../../constants');
var db = require('./../../db_manager');

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
  //var f = constants.FIELDS;

  async.waterfall([//////////////////////////////////////////////////////////////////////////
    function (cb) {  // Устанавливаем свойства
      self.pSocket   = socket;
      self.pVID      = options.vid;
      self.pBDate    = new Date(options.bdate);
      self.pAge      = new Date().getFullYear() - self.pBDate.getFullYear();
      self.pCountry  = options.country;
      self.pCity     = options.city;
      self.pSex      = options.sex;

      if (!self.pSocket) { return cb(new Error("Не задан Socket Id"), null); }
      if (!self.pVID ||  !self.pAge || !self.pCountry || !self.pCity || !self.pSex) {
        return cb(new Error("Не задана одна из опций"), null);
      }

      cb(null, null);
    },
    function (res, cb) {  // Ищем пользователя в базе
      var fList = ["sex", "points", "money", "age", "country", "city", "status",
        "ismenu", "newfriends", "newguests", "newgifts", "newmessages", "gift1"];

      db.findUser(null, self.pVID, fList, function(err, foundUser) {
        if (err) { return cb(err); }
        if (foundUser) {
          self.pID     = foundUser.id;
          self.pStatus = foundUser.status;
          self.pPoints = foundUser.points;
          self.pMoney  = foundUser.money;

          self.pAge     = (self.pAge)     ? self.pAge     : foundUser.age;
          self.pSex     = (self.pSex)     ? self.pSex     : foundUser.sex;
          self.pCountry = (self.pCountry) ? self.pCountry : foundUser.country;
          self.pCity    = (self.pCity)    ? self.pCity    : foundUser.city;
          self.pIsInMenu = foundUser.ismenu || false;

          self.pNewMessages = foundUser.newmessages || 0;
          self.pNewGifts    = foundUser.newgifts    || 0;
          self.pNewFriends  = foundUser.newfriends  || 0;
          self.pNewGuests   = foundUser.newguests   || 0;

          if(foundUser.gift1) {
            db.findGift(foundUser.gift1, function(err, gift) {
              if (err) { return  callback(err, null); }

              self.pGift1 = gift || null;

              cb(null, foundUser);
            });
          } else {

            cb(null, foundUser);
          }
        } else {
          cb(null, null);
        }
      });
    },////////////////////////////////////////////////////////////////////////
    function (foundUser, cb) {  // Если изменились нужные  поля, обмновляем их в базе
      if(foundUser) {
        if(self.pSex    != foundUser.sex     || self.pAge  != foundUser.age  ||
          self.pCountry != foundUser.country || self.pCity != foundUser.city ||
          self.pStatus  != foundUser.status) {

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
        newUser.vid      = self.pVID;
        newUser.age      = self.pAge;
        newUser.country  = self.pCountry;
        newUser.city     = self.pCity;
        newUser.sex      = self.pSex;
        newUser.money    = self.pMoney = Config.settings.start_money;
        newUser.ismenu = self.pIsInMenu;

        db.addUser(newUser, function(err, user) {
          if (err) { return cb(err); }

          self.pID = user.id;

          ///////////////////////////////////////
          //var rand = Math.floor(Math.random()  * 100);
          //
          //self.addPoints(rand, function(err, res) {
          //  if(err) { cb (err, null); }
          //
          //  cb(null, null);
          //});
          //
          //////////////////////////////////////
          cb(null, null);
        });
      } else cb(null, null);
    }
    //////////////////////////////////////////////////////////////////////////////////
  ], function (err) { // Вызвается последней или в случае ошибки
    if (err) { return  callback(err); }

    var info = {};
    info.id          = self.pID;
    info.vid         = self.pVID;
    info.status      = self.pStatus;
    info.points      = self.pPoints;
    info.money       = self.pMoney;
    info.sex         = self.pSex;
    info.age         = self.pAge;
    info.city        = self.pCity;
    info.country     = self.pCountry;
    info.gift1       = self.pGift1;
    info.newmessages = self.pNewMessages;
    info.newgifts    = self.pNewGifts;
    info.newfriends  = self.pNewFriends;
    info.newguests   = self.pNewGuests;

    callback(null, info);
  }); // waterfall

};
