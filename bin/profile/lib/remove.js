const db = require('./../../db_manager');

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

  let self = this;
  self._pSocket   = null;

  self._pVID      = null;
  self._pBDate    = null;
  self._pCountry  = null;
  self._pCity     = null;
  self._pStatus   = null;
  self._pPoints   = null;
  self._pSex      = null;
  self._pMoney    = null;

  self._pIsPrivateChats = null;

  db.deleteGifts(this._pID, function(err, id) {  // Удаляем подарки
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