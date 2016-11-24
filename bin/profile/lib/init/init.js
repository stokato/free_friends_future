var async     = require('async');
var Config = require('./../../../../config.json').user;
var constants = require('../../../constants');
var db = require('./../../../db_manager');

/*
    Инициализируем профиль
 */
module.exports = function(socket, options, callback) {
  var self = this;
  //var f = constants.FIELDS;

  async.waterfall([//////////////////////////////////////////////////////////////////////////
    function (cb) {  // Устанавливаем свойства
      self._pSocket    = socket;
      self._pVID      = options.vid;
      self._pBDate    = new Date(options.bdate);
      self._pAge      = new Date().getFullYear() - self._pBDate.getFullYear();
      self._pCountry  = options.country;
      self._pCity     = options.city;
      self._pSex      = options.sex;

      if (!self._pSocket) { return cb(new Error("Не задан Socket Id"), null); }
      if (!self._pVID ||  !self._pAge || !self._pCountry || !self._pCity || !self._pSex) {
        return cb(new Error("Не задана одна из опций"), null);
      }

      cb(null, null);
    },
    function (res, cb) {  // Ищем пользователя в базе
      var fList = [
        db.CONST.SEX,
        db.CONST.POINTS,
        db.CONST.MONEY,
        db.CONST.AGE,
        db.CONST.COUNTRY,
        db.CONST.CITY,
        db.CONST.STATUS,
        db.CONST.ISMENU,
        db.CONST.GIFT1
      ];

      db.findUser(null, self._pVID, fList, function(err, foundUser) {
        if (err) { return cb(err); }
        if (foundUser) {
          self._pID     = foundUser[db.CONST.ID];
          self._pStatus = foundUser[db.CONST.STATUS];
          self._pPoints = foundUser[db.CONST.POINTS];
          self._pMoney  = foundUser[db.CONST.MONEY];

          self._pAge     = (self._pAge)     ? self._pAge     : foundUser[db.CONST.AGE];
          self._pSex     = (self._pSex)     ? self._pSex     : foundUser[db.CONST.SEX];
          self._pCountry = (self._pCountry) ? self._pCountry : foundUser[db.CONST.COUNTRY];
          self._pCity    = (self._pCity)    ? self._pCity    : foundUser[db.CONST.CITY];
          self._pIsInMenu = foundUser[db.CONST.ISMENU] || false;

          if(foundUser.gift1) {
            db.findGift(foundUser[db.CONST.GIFT1], function(err, gift) {
              if (err) { return  callback(err, null); }

              self._pGift1 = gift || null;

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
        if(self._pSex    != foundUser[db.CONST.SEX]     || self._pAge  != foundUser[db.CONST.AGE]  ||
          self._pCountry != foundUser[db.CONST.COUNTRY] || self._pCity != foundUser[db.CONST.CITY] ||
          self._pStatus  != foundUser[db.CONST.STATUS]) {

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
        newUser[db.CONST.VID]      = self._pVID;
        newUser[db.CONST.AGE]      = self._pAge;
        newUser[db.CONST.COUNTRY]  = self._pCountry;
        newUser[db.CONST.CITY]     = self._pCity;
        newUser[db.CONST.SEX]      = self._pSex;
        newUser[db.CONST.MONEY]    = self._pMoney = Config.settings.start_money;
        newUser[db.CONST.ISMENU]   = self._pIsInMenu;

        db.addUser(newUser, function(err, user) {
          if (err) { return cb(err); }

          self._pID = user[db.CONST.ID];
          
          cb(null, null);
        });
      } else cb(null, null);
    }
    //////////////////////////////////////////////////////////////////////////////////
  ], function (err) { // Вызвается последней или в случае ошибки
    if (err) { return  callback(err); }

    callback(null, self._pID);
  }); // waterfall

};
