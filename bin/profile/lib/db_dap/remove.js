var db = require('./../../../db_manager');
/*
 Удаляем польлзователя из БД
 - Очищаем свойста
 - Удаляем подарки
 - личные сообщения
 - друзей
 - гостей
 - самого поьзователя
 */
module.exports = function(callback) {

  var self = this;
  self.pSocket   = null;

  self.pVID      = null;
  self.pAge      = null;
  self.pCountry  = null;
  self.pCity     = null;
  self.pStatus   = null;
  self.pPoints   = null;
  self.pSex      = null;
  self.pMoney    = null;

  self.pPrivateChats = null;

  db.deleteGifts(this.pID, function(err, id) {  // Удаляем подарки
    if(err) { return callback(err, null); }
    db.deleteMessages(id, function(err, id) { // и историю
      if(err) { return callback(err, null) }
      db.deleteFriends(id, null, function(err, id) { // и друзей
        if(err) { return callback(err, null) }
        db.deleteGuests(id, function(err, id) { // и гостей
          if(err) { return callback(err, null) }

          db.deleteUser(id, function(err, id) { // и самого пользователя
            if(err) { return callback(err, null) }

            callback(null, id);
          });
        });
      });
    });
  });
};