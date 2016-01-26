var db        = require('./db.js');
var dbManager = new db();
//var waterfall = require('async-waterfall');
var async     = require('async');

/**
 * Класс профиль пользователя, хранит, обменивается с базой и обрабатывает данные о пользователе
 * Свойства: ИД, имя, аватар, возраст, местоположение, статус, история сообщений (массив), подарки (коллекция)
 * Методы: построить - ищет данные о пользователе в базе (если нет - на стороне) и заполняет профиль
 *         установить статус, получить статус, установить инф. (прочие свойства), получить инф.,
 *         добавить подарок, получить все подарки,
 *         добавить сообщиение в историю, получить все (или n) сообщений из истории
 *         сохранить текущий профиль в базу
 *         удалить текущий профиль из базы и очистить все свойства
 */
function Profile() {
  var pSocket   = null;

  var pID       = null;
  var pVID      = null;
  
  var pName     = null;
  var pAvatar   = null;
  var pAge      = null;
  var pLocation = null;
  var pGender   = null;

  var pStatus   = null;
  var pPoints   = null;
  var pMoney    = null;

  var gift_1   = null;
  var gift_2   = null;
  
  var pHistory  = [];
  var pGifts    = [];
  var pFriends  = [];
  var pGuests   = [];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Строим профиль пользователя из информации, хранящейся в базе или полученной извне
// Если раньше в базе такого небыло - добавляем
Profile.prototype.init = function(soketid, opt, callback) {
  var self = this;
  async.waterfall([
  //////////////////////////////////////////////////////////////////////////
    function (cb) {  // Устанавливаем свойства
      var options = opt || {};

      self.pSocket   = socketid;

      self.pVID      = options.vid;

      self.pName     = options.name;
      self.pAvatar   = options.avatar;
      self.pAge      = options.age;
      self.pLocation = options.location;
      self.pGender   = options.gender;

      if (!pSocket) { return cb(new Error("Не задан Socket Id"), null); }
      if (!pVID || !pName || !pAvatar || !pAge || !pLocation || !pGender) {
        return cb(new Error("На задана одна из опций"), null);
      }

      cb(null, null);
    },
    function (res, cb) {  // Ищем пользователя в базе
      dbManager.findUser(null, self.pVID, function(err, foundUser) {
        if (err) { return cb(err); }
        if (foundUser) {
          self.pID     = foundUser.pId;
          self.pStatus = foundUser.status;
          self.pPoints = foundUser.points;
          self.pMoney  = foundUser.money;
        }
        cb(null, foundUser);
      });
    },
  ///////////////////////////////////////////////////////////////////////////
    function (foundUser, cb) { // Если такой есть в базе, получаем его подарки
      if(foundUser) {
        dbManager.findGifts(foundUser.id, function(err, gifts) {
          if (err) { cb(err, null); }

          self.pGifts = gifts || [];

          cb(null, foundUser);
        });
      } else cb(null, foundUser);
    },
  ///////////////////////////////////////////////////////////////////////////
    function (foundUser, cb) { // и историю сообщений
      if(foundUser) {
        dbManager.findMessages(foundUser.id, function(err, messages) {
          if (err) { cb(err, null); }

          self.pHistory = messages || [];

          cb(null, foundUser);
        });
      } else cb(null, foundUser);
    },
    ///////////////////////////////////////////////////////////////////////////
    function (foundUser, cb) { // и друзей
      if(foundUser) {
        dbManager.findFriends(foundUser.id, function(err, friends) {
          if (err) { cb(err, null); }

          self.pFriends = friends || [];

          cb(null, foundUser);
        });
      } else cb(null, foundUser);
    },
    ///////////////////////////////////////////////////////////////////////////
    function (foundUser, cb) { // и гостей
      if(foundUser) {
        dbManager.findGuests(foundUser.id, function(err, guests) {
          if (err) { cb(err, null); }

          self.pGuests = guests || [];

          cb(null, foundUser);
        });
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
// Установить новый сокет
Profile.prototype.setSocket = function(socket, callback) {
  this.pSocket = socket;
  callback(null, this.pSocket);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////
// Получить текущий сокет
Profile.prototype.getSocket = function() {
  return this.pSocket;
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Установить сведения о пользователе
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
// Получить сведения о пользователе
Profile.prototype.getInfo = function() {
  var options = {
    id       : this.pId,
    vid      : this.pVID,
    name     : this.pName,
    avatar   : this.pAvatar,
    age      : this.pAge,
    location : this.pLocation,
    gender   : this.pGender,
    status   : this.pStatus,
    points   : this.pPoints,
    money    : this.pMoney,
    socket   : this.pSocket
  };
  return options;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
// Добавить подарок 
Profile.prototype.addGift = function(gift, callback) {
  this.pGifts.push(gift);

  callback(null, gift);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////
// Получить все подарки
Profile.prototype.getGifts = function() {
  return this.pGifts;
};
////////////////////////////////////////////////////////////////////////////////////////////////////
// Добавить сообщение в историю
// Сообщение должно иметь поля: собеседник, входящее/true, текст, дата, и подарок (если есть)
Profile.prototype.addMessage = function(message, callback) {
  if (!message.companion || !message.text || !message.date || !message.date) { // incom?
    return callback(new Error("Ошибка при добавлении сообщения в историю: заданы не все аргументы"));
  }
  
  this.pHistory.push(message);

  callback(null, message);
};
////////////////////////////////////////////////////////////////////////////////////////////////////
// Получить историю сообщений, если задан параметр count - указанное количество с конца
// Если задан position - count с указанной позиции
Profile.prototype.getHistory = function(count, position) {
  if (!count) {
    return this.pHistory;
  } else {

  var history = [];
  var first = (position)? position : this.pHistory.length-1 - count;
  var last  = (position && (position + count) < this.pHistory.length-1)? position + count
                                                                      : this.pHistory.length-1;

  for (var i = first; i <= last; i++) {
    history.push(this.pHistory[i]);
  }
  return history;
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////
// Добавить очки пользователю
Profile.prototype.addPoints = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Ошибка при добавлении очков пользователю, количество очков задано некорректно"));
  }
  this.pPoints = this.pPoints + num;

  callback(null, this.pPoints);
};
///////////////////////////////////////////////////////////////////////////////////////////////
// Добавить пользователя в друзья
Profile.prototype.addToFriends = function(friend, callback) {
  var self = this;
  async.waterfall([
    //////////////////////////////////////////////////////////////////////////
    function(cb) {
      for(var i = 0; i < self.pFriends.length; i++) {
        if(self.pFriends[i].id == friend.id) { return cb(new Error("Этот пользователь уже в списке ваших друзей")); }
      }
      cb(null, null);
    },
    function (res, cb) {  // Ищем пользователя в базе
      dbManager.findUser(friend.id, function(err, foundUser) {
        if (err) { return cb(err); }
        if (foundUser) {
          self.pFriends.push(friend);
          cb(null, friend);
        } else {
          cb(new Error("Такого пользователя нет в базе данных"));
        }
      });
    }
      ], function(err, friend) {
    if(err) { return callback(err, null); }

    callback(null, friend);
  })
};
///////////////////////////////////////////////////////////////////////////////////////////////
// Получить список друзей
Profile.prototype.getFriends = function() {
  return this.friends;
};
///////////////////////////////////////////////////////////////////////////////////////////////
// Добавить гостя в список гостей
Profile.prototype.addToGuests = function(guest, callback) {
  var self = this;
  async.waterfall([
    //////////////////////////////////////////////////////////////////////////
    function(cb) {
      for(var i = 0; i < self.pGuests.length; i++) {
        if(self.pGuests[i].id == guest.id) { // Если уже есть, перезаписываем
          self.pGuests = guest;
          return cb(null, true)
        }
      }
      cb(null, false);
    },
    function (isGuest, cb) {  // Ищем пользователя в базе
      if(!isGuest) {
        dbManager.findUser(guest.id, function(err, foundUser) {
          if (err) { return cb(err); }
          if (foundUser) {
            self.pFriends.push(guest);
            cb(null, guest);
          } else {
            cb(new Error("Такого пользователя нет в базе данных"));
          }
        });
      } else cb(null, guest);

    }
  ], function(err, guest) {
    if(err) { return callback(err, null); }

    callback(null, guest);
  })
};
///////////////////////////////////////////////////////////////////////////////////////////////
// Получить список друзей
Profile.prototype.getGuests = function(callback) {
  return this.pGuests;
};
///////////////////////////////////////////////////////////////////////////////////////////////
// Сохранить профиль в базу данных
Profile.prototype.save = function(callback) {
  var self = this;
  var options = {
    id       : self.pId,
    vid      : self.pVID,
    age      : self.pAge,
    location : self.pLocation,
    gender   : self.pGender,
    status   : self.pStatus,
    points   : self.pPoints,
    money    : self.money
  };

  async.waterfall([
      function(cb) { // Сохраняем данные пользователя
        dbManager.updateUser(options, function(err, id) {
          if (err) {return cb(err, null); }
          cb(null, id);
        });
      },
      function(id, cb) { // Удаляем устаревший список подарков
        dbManager.deleteGifts(id, function(err, id) {
          if(err) { return cb(err, null); }
          cb(null, id);
        })
      },
      function(id, cb) { // Добавляем обновленный список подароков
        async.map(self.pGifts, function(gift, cb_inmap) {
          dbManager.addGift(id, gift, function(err, res) {
            if (err) { return cb_inmap(err, null); }
            cb_inmap(null, null);
          });
        }, function(err, results){
          if (err)  { return cb(err, null); }
          cb(null, id);
        });
      },
      function(id, cb) { // Удаляем старую историю сообщений
        dbManager.deleteMessages(id, function(err, id) {
          if(err) { return cb(err, null) }
          cb(null, id);
        })
      },
      function(id, cb) { // Добавляем обновленную историю сообщений
        async.map(self.pHistory, function(msg, cb_inmap) {
          dbManager.addMessage(id, msg, function(err, res) {
            if (err) { return cb_inmap(err, null); }
            cb_inmap(null, null);
          });
        }, function(err, results){
          if (err)  { return cb(err, null); }
          cb(null, id);
        });
      },
    function(id, cb) { // Удаляем старый список друзей
      dbManager.deleteFriends(id, function(err, id) {
        if(err) { return cb(err, null) }
        cb(null, id);
      })
    },
    function(id, cb) { // Добавляем обновленный список друзей
      async.map(self.pFriends, function (friend, cb_inmap) {
        dbManager.addFriend(id, friend, function (err, res) {
          if (err) {
            return cb_inmap(err, null);
          }
          cb_inmap(null, null);
        });
      }, function (err, results) {
        if (err) {
          return cb(err, null);
        }
        cb(null, id);
      });
    }
  ], function(err, id) { // Вызывается последней или в случае ошибки
      if(err) { return callback(err)}
      callback(null, id);
  });
};

//////////////////////////////////////////////////////////////////////////////////////////
// Удаляем пользователя из базы
Profile.prototype.remove = function(callback) {

  this.pSocket   = null;

  this.pVID      = null;
  this.pName     = null;
  this.pAvatar   = null;
  this.pAge      = null;
  this.pLocation = null;
  this.pStatus   = null;

  this.pHistory  = null;
  this.pGifts    = null;
  this.pFriends  = null;

  this.pPoints   = null;
  this.pGender   = null;
  this.pMoney    = null;

  dbManager.deleteUser(this.pId, function(err, id) {
    if (err) { callback(err, null); }
    dbManager.deleteGifts(id, function(err, id) {  // Удаляем подарки
      if(err) { return callback(err, null); }
      dbManager.deleteMessages(id, function(err, id) { // и историю
        if(err) { return callback(err, null) }

        dbManager.deleteFriends(id, function(err, id) { // и друзей
          if(err) { return callback(err, null) }

          dbManager.deleteGuests(id, function(err, id) { // и гостей
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