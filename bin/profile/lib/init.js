/**
 * Инициализируем профиль
 * @param socket, options - вид, дата рождения, страна, город, пол, callback
 *
 * @return info - сведения о пользователе
 */

var async     = require('async');

var Config    = require('./../../../config.json'),
    constants = require('../../constants'),
    IOF       = constants.PFIELDS,
    db        = require('./../../db_manager');

var BLOCK_TIMEOUT = Number(Config.user.settings.user_block_timeout);

module.exports = function(socket, options, callback) {
  var self = this;

  async.waterfall([//---------------------------------------------------
    function (cb) {  // Устанавливаем свойства
      self._pSocket   = socket;
      self._pVID      = options[IOF.VID];
      self._pBDate    = new Date(options[IOF.BDATE]);
      self._pCountry  = options[IOF.COUNTRY];
      self._pCity     = options[IOF.CITY];
      self._pSex      = options[IOF.SEX];

      if (!self._pSocket) { return cb(new Error("Не задан Socket Id"), null); }
      
      if (!self._pVID ||  !self._pBDate || !self._pCountry || !self._pCity || !self._pSex) {
        return cb(new Error("Не задана одна из опций"), null);
      }

      cb(null, null);
    },//---------------------------------------------------
    function (res, cb) {  // Ищем пользователя в базе
      var fList = [
        IOF.SEX,
        IOF.POINTS,
        IOF.MONEY,
        IOF.BDATE,
        IOF.COUNTRY,
        IOF.CITY,
        IOF.STATUS,
        IOF.ISMENU,
        IOF.GIFT1
      ];

      db.findUser(null, self._pVID, fList, function(err, foundUser) {
        if (err) { return cb(err); }
        if (foundUser) {
          self._pID     = foundUser[IOF.ID];
          self._pStatus = foundUser[IOF.STATUS];
          self._pPoints = foundUser[IOF.POINTS];
          self._pMoney  = foundUser[IOF.MONEY];

          self._pBDate    = (self._pBDate)   ? self._pBDate     : foundUser[IOF.BDATE];
          self._pSex      = (self._pSex)     ? self._pSex     : foundUser[IOF.SEX];
          self._pCountry  = (self._pCountry) ? self._pCountry : foundUser[IOF.COUNTRY];
          self._pCity     = (self._pCity)    ? self._pCity    : foundUser[IOF.CITY];
          self._pIsInMenu = foundUser[IOF.ISMENU] || false;

          if(foundUser[IOF.GIFT1]) {
            db.findGift(foundUser[IOF.GIFT1], function(err, gift) {
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
    },//---------------------------------------------------
    function (foundUser, cb) {  // Если изменились нужные  поля, обмновляем их в базе
      if(foundUser) {
        if(self._pSex    != foundUser[IOF.SEX]     || self._pBDate != foundUser[IOF.BDATE]  ||
          self._pCountry != foundUser[IOF.COUNTRY] || self._pCity  != foundUser[IOF.CITY] ||
          self._pStatus  != foundUser[IOF.STATUS]) {

          self.save(function(err) {
            if (err) { return cb(err); }

            cb(null, foundUser);
          });
        } else cb(null, foundUser);
      } else cb(null, foundUser);
    },
    //---------------------------------------------------
    function (foundUser, cb) {  // Получаем черный список
      if(foundUser) {
        db.findBlocked(self._pID, function(err, blockedUsers) {
          if(err) { return cb(err, null); }
          
          var now = new Date();
          for(var i = 0; i < blockedUsers.length; i++) {
            if(now - blockedUsers[i][IOF.DATE] < BLOCK_TIMEOUT) {
              
              var delay = now - blockedUsers[i][IOF.DATE];
              self._pBlackList[blockedUsers[i][IOF.ID]] = {
                date : blockedUsers[i][IOF.DATE],
                timeout : setBlockedTimeout(self, blockedUsers[i][IOF.ID], delay)
              }
            }
          }
          
          return cb(null, foundUser);
        });
      } else cb(null, foundUser);
    },
    //---------------------------------------------------
    function (foundUser, cb) { // Если в базе такого нет, добавляем
      if (!foundUser) {
        // Добавляем пользователя

        var newUser = {};
        newUser[IOF.VID]      = self._pVID;
        newUser[IOF.BDATE]    = self._pBDate;
        newUser[IOF.COUNTRY]  = self._pCountry;
        newUser[IOF.CITY]     = self._pCity;
        newUser[IOF.SEX]      = self._pSex;
        newUser[IOF.MONEY]    = self._pMoney = Config.moneys.start_money;
        newUser[IOF.ISMENU]   = self._pIsInMenu;

        db.addUser(newUser, function(err, user) {
          if (err) { return cb(err); }

          self._pID = user[IOF.ID];
          
          cb(null, null);
        });
      } else cb(null, null);
    }
    //---------------------------------------------------
  ], function (err) { // Вызвается последней или в случае ошибки
    if (err) { return  callback(err); }

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
    
    self._pInitTime    = new Date();
    
    callback(null, info);
  }); // waterfall
  
  
  function setBlockedTimeout(profile, blockedID, delay) {
    
    var timeout = setTimeout(function () {
      profile.delFromBlackList(blockedID, function (err) {
        if(err){ console.log("Ошибка при удалении пользователя из черного списка");}
      })
    }, delay);
    
    return timeout;
  }
};
