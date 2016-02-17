var async     = require('async');
/*
 Инициализируем профиль
 - Устанавливаем полученные из соц сети свойства (в БД они точно не нужны, а в ОЗУ ???)
 - Что-то проверяем
 - Ищем пользователя в БД и заполняем оставшиеся свойства
 - Если нет - добавляем
 - Возвращаем свойсва
 */
module.exports = function(socket, opt, callback) {
  var self = this;
  async.waterfall([//////////////////////////////////////////////////////////////////////////
    function (cb) {  // Устанавливаем свойства
      var options = opt || {};

      self.pSocket   = socket;
      self.pVID      = options.vid;
      self.pAge      = options.age;
      self.pCountry  = options.country;
      self.pCity     = options.city;
      self.pSex      = options.sex;

      if (!self.pSocket) { return cb(new Error("Не задан Socket Id"), null); }
      if (!self.pVID ||  !self.pAge || !self.pCountry || !self.pCity || !self.pSex) {
        return cb(new Error("На задана одна из опций"), null);
      }

      cb(null, null);
    },
    function (res, cb) {  // Ищем пользователя в базе
      var fList = ["sex", "points", "money", "age", "country", "city", "status"];
      self.dbManager.findUser(null, self.pVID, fList, function(err, foundUser) {
        if (err) { return cb(err); }
        if (foundUser) {
          self.pID     = foundUser.id;
          self.pStatus = foundUser.status;
          self.pPoints = foundUser.points;
          self.pMoney  = foundUser.money;

          self.pNewMessages = foundUser.newmessages || 0;
          self.pNewGifts    = foundUser.newgifts    || 0;
          self.pNewFriends  = foundUser.newfriends  || 0;
          self.pNewGuests   = foundUser.newguests   || 0;
        }
        cb(null, foundUser);
      });
    },
    function (foundUser, cb) {  // Если изменились нужные  поля, обмновляем их в базе
      if(foundUser) {
        if(self.pSex != foundUser.sex || self.pAge != foundUser.age ||
          self.pCountry != foundUser.country || self.pCity != foundUser.city ||
          self.pStatus != foundUser.status) {

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

        var newUser = {
          vid     : self.pVID,
          age     : self.pAge,
          country : self.pCountry,
          city    : self.pCity,
          sex     : self.pSex
        };

        self.dbManager.addUser(newUser, function(err, user) {
          if (err) { return cb(err); }

          self.pID = user.id;

          cb(null, null);
        });
      } else cb(null, null);
    }
    //////////////////////////////////////////////////////////////////////////////////
  ], function (err) { // Вызвается последней или в случае ошибки
    if (err) { return  callback(err); }

    var info = {
      id       : self.pID,
      vid      : self.pVID,
      status   : self.pStatus,
      points   : self.pPoints,
      money    : self.pMoney,
      messages : self.pNewMessages,
      gifts    : self.pNewGifts,
      friends  : self.pNewFriends,
      guests   : self.pNewGifts
    };
    callback(null, info);
  }); // waterfall

};
