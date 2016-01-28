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
  
  var pName     = null;   // ???
  var pAvatar   = null;   // ???
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
- Возвращаем все свойсва (или не все ???)
 */
Profile.prototype.init = function(socket, opt, callback) {
  var self = this;
  async.waterfall([
  //////////////////////////////////////////////////////////////////////////
    function (cb) {  // Устанавливаем свойства
      var options = opt || {};

      self.pSocket   = socket;

      self.pVID      = options.vid;

      self.pName     = options.name;
      self.pAvatar   = options.avatar;
      self.pAge      = options.age;
      self.pLocation = options.location;
      self.pGender   = options.gender;

      //if (!self.pSocket) { return cb(new Error("Не задан Socket Id"), null); }
      if (!self.pVID || !self.pName || !self.pAvatar || !self.pAge || !self.pLocation || !self.pGender) {
        return cb(new Error("На задана одна из опций"), null);
      }

      cb(null, null);
    },
    function (res, cb) {  // Ищем пользователя в базе
      var fList = ["name", "gender", "points", "money", "age", "location", "status"];
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

        dbManager.addUser(newUser, function(err, addedUser) {
          if (err) { return cb(err); }
          if (addedUser) {
            self.pID = addedUser.id;
            cb(null, null);
          } else {
            return cb(new Error("Ошибка при добавлении пользователя в базу данных"));
          }
        });
      } else cb(null, null);
    }
   //////////////////////////////////////////////////////////////////////////////////
  ], function (err, result) { // Вызвается последней или в случае ошибки
    if (err) {
      console.log(err);
     return  callback(err);
    }
    
    var info = {
      id       : self.pID,
      vid      : self.pVID,
      name     : self.pName,
      avatar   : self.pAvatar,
      age      : self.pAge,
      location : self.pLocation,
      status   : self.pStatus,
      points   : self.pPoints,
      money    : self.pMoney,
      gender   : self.pGender
    };
    callback(null, info);
  }); // waterfall

};

//////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Устанавливаем новый сокет
 */
Profile.prototype.setSocket = function(socket, callback) {
  this.pSocket = socket;
  callback(null, this.pSocket);
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Устанавливаем свойста (пока не используется) Стату и пол ???
 */
Profile.prototype.setInfo = function(options, callback) {
  this.pName       = (options.name)?     options.name : this.pName;
  this.pAvatar     = (options.avatar)?   options.avatar : this.pAvatar;
  this.pAge        = (options.age)?      options.age : this.pAge;
  this.pLocation   = (options.location)? options.location : this.pLocation;
  this.pStatus     = (options.status)?   options.status : this.pStatus;
  this.pGender     = (options.gender)?   options.gender : this.pGender;
  
  callback(null, options);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Поулчаем сведения по пользователе
- Или последние 4 каждый раз берутся из соц сетей (а может и пол) ???
 */
Profile.prototype.getInfo = function() {
  var options = {
    id       : this.pID,
    vid      : this.pVID,
    gender   : this.pGender,
    status   : this.pStatus,
    points   : this.pPoints,

    name     : this.pName,
    avatar   : this.pAvatar,
    age      : this.pAge,
    location : this.pLocation
  };
  return options;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Добавляем подарок в БД
 */
Profile.prototype.addGift = function(gift, callback) {
  self = this;
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
  if (!message.companion || !message.text || !message.date || !message.date) { // incom?
    return callback(new Error("Ошибка при добавлении сообщения в историю: заданы не все аргументы"));
  }
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
  self = this;
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
Получаме гостей из БД
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
    if (err) {console.log(err); return callback(err, null); }

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
  this.pName     = null;
  this.pAvatar   = null;
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