var db        = require('./db.js');
var dbManager = new db();
//var waterfall = require('async-waterfall');
var async     = require('async');

/**
 * Класс профиль пользователя, хранит, обменивается с базой и обрабатывает данные о пользователе
 * Свойства: ИД, имя, аватар, возраст, местоположение, статус, пол, очки, деньги (подарки, которы висят на столе ???)
 * Методы: инициализировать - ищет данные о пользователе в базе, если нет - создает новый и заполняет профиль
 *         установить статус, получить статус, установить инф. (прочие свойства), получить инф.,
 *         добавить подарок, получить все подарки,
 *         добавить сообщиение в историю, получить все (или n) сообщений из истории,
 *         добавить друга, получить друзей,
 *         добавить гостя, получить госте,
 *         сохранить текущий профиль в базу,
 *         удалить текущий профиль из базы и очистить все свойства
 */
function Profile() {
  var pSocket   = null;   // Сокет

  var pID       = null;   // Внутренний ИД
  var pVID      = null;   // Внешний

  var pAge      = null;   // ???
  var pLocation = null;   // ???

  var pGender   = null;   // пол игрока
  var pStatus   = null;   // статус (заводит игрок)
  var pPoints   = null;   // очки
  var pMoney    = null;   // деньги

  var gift_1   = null;    // На игрвом столе на аватарах игроков весят подарки, по ним не ясно
  var gift_2   = null;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Инициализируем профиль
- Устанавливаем полученные из соц сети свойства (в БД они точно не нужны, а в ОЗУ ???)
- Что-то проверяем
- Ищем пользователя в БД и заполняем оставшиеся свойства
- Если нет - добавляем
- Возвращаем свойсва
 */
Profile.prototype.init = function(socket, opt, callback) {
  var self = this;
  async.waterfall([
  //////////////////////////////////////////////////////////////////////////
    function (cb) {  // Устанавливаем свойства
      var options = opt || {};

      self.pSocket   = socket;

      self.pVID      = options.vid;

      self.pAge      = options.age;
      self.pLocation = options.location;
      self.pGender   = options.gender;

      //if (!self.pSocket) { return cb(new Error("Не задан Socket Id"), null); }
      if (!self.pSocket || !self.pVID ||  !self.pAge || !self.pLocation || !self.pGender) {
        return cb(new Error("На задана одна из опций"), null);
      }

      cb(null, null);
    },
    function (res, cb) {  // Ищем пользователя в базе
      var fList = ["gender", "points", "money", "age", "location", "status"];
      dbManager.findUser(null, self.pVID, fList, function(err, foundUser) {
        if (err) { return cb(err); }
        if (foundUser) {
          self.pID     = foundUser.id;
          self.pStatus = foundUser.status;
          self.pPoints = foundUser.points;
          self.pMoney  = foundUser.money;
        }
        cb(null, foundUser);
      });
    },
    function (foundUser, cb) {  // Если изменились нужные  поля, обмновляем их в базе
      if(foundUser) {
        if(self.pGender != foundUser.gender || self.pAge != foundUser.age || self.pLocation != foundUser.location
            || self.pStatus != foundUser.status) {
          self.save(function(err, res) {
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
          location: self.pLocation,
          gender  : self.pGender
        };

        dbManager.addUser(newUser, function(err, user) {
          if (err) { return cb(err); }

          self.pID = user.id;

          cb(null, null);
        });
      } else cb(null, null);
    }
   //////////////////////////////////////////////////////////////////////////////////
  ], function (err, result) { // Вызвается последней или в случае ошибки
    if (err) { return  callback(err); }
    
    var info = {
      id       : self.pID,
      vid      : self.pVID,
      status   : self.pStatus,
      points   : self.pPoints,
      money    : self.pMoney
    };
    callback(null, info);
  }); // waterfall

};
////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Инициализируем профиль
 - Устанавливаем полученные из соц сети свойства (в БД они точно не нужны, а в ОЗУ ???)
 - Что-то проверяем
 - Ищем пользователя в БД и заполняем оставшиеся свойства
 - Если нет - добавляем
 - Возвращаем свойсва
 */
Profile.prototype.build = function(id, callback) {
  var self = this;
  self.pID = id;

  if (!self.pID) { return callback(new Error("Не задан ИД"), null); }

  var fList = ["gender", "points", "status", "location", "age"];
  dbManager.findUser(self.pID, null, fList, function(err, foundUser) {
    if (err) { return  callback(err, null); }
    if (!foundUser) { return callback(new Error("Такого пользователя нет в БД"), null); }

    self.pVID     = foundUser.vid;
    self.pStatus = foundUser.status;
    self.pPoints = foundUser.points;
    self.pGender = foundUser.gender;
    self.pLocation = foundUser.location;
    self.pAge = foundUser.age;

    // self.pMoney  = foundUser.money;

    var info = {
      id       : self.pID,
      vid      : self.pVID,
      age      : self.pAge,
      location : self.pLocation,
      status   : self.pStatus,
      points   : self.pPoints,
      //money    : self.pMoney,
      gender   : self.pGender
    };

    callback(null, info);
  });
};
////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Получаем сокет
 */
Profile.prototype.getSocket = function() {
  return this.pSocket;
};

/*
Получаем деньги
 */
Profile.prototype.getMoney = function() {
  return this.pMoney;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Поулчаем id игрока
 */
Profile.prototype.getID = function() {
  return this.pID;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Поулчаем vid игрока
 */
Profile.prototype.getVID = function() {
  return this.pVID;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Поулчаем статус игрока
 */
Profile.prototype.getStatus = function() {
  return this.pStatus;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Поулчаем очки игрока
 */
Profile.prototype.getPoints = function() {
  return this.pPoints;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Поулчаем пол игрока
 */
Profile.prototype.getGender = function() {
  return this.pGender;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Добавляем подарок в БД
 */
Profile.prototype.addGift = function(gift, callback) {
  var self = this;
  dbManager.addGift(self.pID, gift, function(err, res) {
    if (err) { return callback(err, null); }

    callback(null, gift);
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Получаем из БД все подарки
 */
Profile.prototype.getGifts = function(callback) {
  var self = this;
  dbManager.findGifts(self.pID, function(err, gifts) {
    if (err) { callback(err, null); }

    callback(null, gifts);
  });
};
////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Сохраняем личное сообщение в БД
- Сообщение должно иметь поля: собеседник, входящее/bool, текст, дата
 */
Profile.prototype.addMessage = function(message, callback) {
  var self = this;
  dbManager.addMessage(self.pID, message, function(err, res) {
    if (err) { return callback(err, null); }

    callback(null, null);
  });
};
////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Получаем историю сообщений:
- Читаем из БД
- Если задан параметр count - указанное количество с конца
- Если задан position - count с указанной позиции
 */
Profile.prototype.getHistory = function(count, position, callback) {
  var self = this;
  dbManager.findMessages(self.pID, function(err, messages) {
    if (err) { return callback(err, null); }

    if (!count) {
      callback(null, messages);
    } else {
      var history = [];
      var first = (position)? position : messages.length-1 - count;
      var last  = (position && (position + count) < messages.length-1)? position + count
          : messages.length-1;

      for (var i = first; i <= last; i++) {
        history.push(messages[i]);
      }
      callback(null, history);
    }
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////
/*
Добавляем очки пользователю
- Сначала в БД и если успешно
- В ОЗУ
- Возвращаем
 */
Profile.prototype.addPoints = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Ошибка при добавлении очков пользователю, количество очков задано некорректно"));
  }
  var self = this;
  var options = {
    id : self.pID,
    vid : self.pVID,
    points : self.pPoints + num
  };

  dbManager.updateUser(options, function(err, id) {
    if (err) {return callback(err, null); }

    self.pPoints = options.points;
    callback(null, self.pPoints);
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Устанавливаем количество монет игрока
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
Profile.prototype.setMoney = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Ошибка при установке количества монет, количество монет задано некорректно"));
  }
  var self = this;
  var options = {
    id : self.pID,
    vid : self.pVID,
    money : num
  };

  dbManager.updateUser(options, function(err, id) {
    if (err) {return callback(err, null); }

    self.pMoney = options.money;
    callback(null, self.pMoney);
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Устанавливаем статус игрока
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
Profile.prototype.setStatus = function(str, callback) {
  var self = this;
  var options = {
    id : self.pID,
    vid : self.pVID,
    status : str
  };

  dbManager.updateUser(options, function(err, id) {
    if (err) {return callback(err, null); }

    self.pStatus = options.status;
    callback(null, self.pStatus);
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////
/*
 Добавляем друга в БД
 */
Profile.prototype.addToFriends = function(friend, callback) {
  var self = this;
  dbManager.addFriend(self.pID, friend, function (err, res) {
    if (err) { return callback(err, null); }
    callback(null, friend);
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////
/*
Получаем всех друзей из БД
 */
Profile.prototype.getFriends = function(callback) {
  var self = this;
  dbManager.findFriends(self.pID, function(err, friends) {
    if (err) { return callback(err, null); }

    callback(null, friends);
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////
/*
Добавляем гостя в БД
 */
Profile.prototype.addToGuests = function(guest, callback) {
  var self = this;
  dbManager.addGuest(self.pID, guest, function(err, res) {
    if (err) { return callback(err, null); }

    callback(null, res);
  })
};
///////////////////////////////////////////////////////////////////////////////////////////////
/*
Получаем гостей из БД
 */
Profile.prototype.getGuests = function(callback) {
  var self = this;
  dbManager.findGuests(self.pID, function(err, guests) {
    if (err) { return callback(err, null); }

    callback(null, guests);
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////
/*
Сохраняем профиль в БД
 */
Profile.prototype.save = function(callback) {
  var self = this;
  var options = {
    id       : self.pID,
    vid      : self.pVID,
    age      : self.pAge,
    location : self.pLocation,
    gender   : self.pGender,
    status   : self.pStatus,
    points   : self.pPoints,
    money    : self.money
  };


  dbManager.updateUser(options, function(err, id) {
    if (err) { return callback(err, null); }

    callback(null, id);
  });
};

//////////////////////////////////////////////////////////////////////////////////////////
/*
Удаляем польлзователя из БД
- Очищаем свойста
- Удаляем подарки
- личные сообщения
- друзей
- гостей
- самого поьзователя
 */
Profile.prototype.remove = function(callback) {

  this.pSocket   = null;

  this.pVID      = null;
  this.pAge      = null;
  this.pLocation = null;
  this.pStatus   = null;

  this.pPoints   = null;
  this.pGender   = null;
  this.pMoney    = null;

  dbManager.deleteGifts(this.pId, function(err, id) {  // Удаляем подарки
    if(err) { return callback(err, null); }
    dbManager.deleteMessages(id, function(err, id) { // и историю
      if(err) { return callback(err, null) }
      dbManager.deleteFriends(id, function(err, id) { // и друзей
        if(err) { return callback(err, null) }
        dbManager.deleteGuests(id, function(err, id) { // и гостей
          if(err) { return callback(err, null) }

          dbManager.deleteUser(id, function(err, id) { // и самого пользователя
            if(err) { return callback(err, null) }

            callback(null, id);
          });
        });
      });
    });
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////

module.exports = Profile;
////////////////////////////////////////////////////////////////////////////////////////////////
function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}