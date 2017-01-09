/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 *
 * Убираем у друзей/гостей/подарков метку is_new - новый
 *
 * @param target - флаг, кого отментить просмотренным
 * @return target
 */
const  constants = require('./../../constants');
const  db = require('./../../db_manager');

module.exports = function (target, callback) {
  
  switch (target) {
    case constants.VIEWED_TYPE.FRIENDS :
      db.openFriends(this._pID, onComplete);
      break;
    case constants.VIEWED_TYPE.GUESTS :
      db.openGuests(this._pID, onComplete);
      break;
    case constants.VIEWED_TYPE.GIFTS :
      db.openGifts(this._pID, onComplete);
      break;
    case constants.VIEWED_TYPE.MESSAGES :
      onComplete(null); // Новые сообщения обнуляем при открытии чата
      break;
    default :
      callback(new Error("Не задана цель для обновления"));
  }
  
  //-----------------------------------------
  function onComplete(err) {
    if(err) { return callback(err); }
    
    callback(null, target);
  }
};