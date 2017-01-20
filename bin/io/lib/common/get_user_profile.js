/**
 * Получаем профиль пользователя по его ид
 *
 * @param id, callback
 */

const oPool     = require('./../../../objects_pool');
const ProfileJS = require('../../../profile/index');

module.exports = function (id, callback) {
  
  let profile = null;
  
  if (oPool.profiles[id]) {        // Если онлайн
    
    profile = oPool.profiles[id];
  
    callback(null, profile);
  } else {                           // Если нет - берем из базы
    
    profile = new ProfileJS();
    profile.build(id, (err) => {  // Нужен VID и все поля, как при подключении
      if (err) {
        return callback(err, null);
      }
  
      callback(null, profile);
    });
    
  }
};