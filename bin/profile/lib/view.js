/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 *
 * Убираем у друзей/гостей/подарков метку is_new - новый
 *
 * @param target - флаг, кого отментить просмотренным
 * @return target
 */

const Config = require('./../../../config.json');
const  db = require('./../../db_manager');
const VT = Config.user.constants.viewed_types;

module.exports = function (target, callback) {
  
  switch (target) {
    case VT.FRIENDS :
      db.openFriends(this._pID, onComplete);
      break;
    case VT.GUESTS :
      db.openGuests(this._pID, onComplete);
      break;
    case VT.GIFTS :
      db.openGifts(this._pID, onComplete);
      break;
    case VT.MESSAGES :
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