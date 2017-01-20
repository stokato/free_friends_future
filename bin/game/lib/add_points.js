/**
 *  Добавляем пользователю очки
 *
 */

const oPool         = require('./../../objects_pool');
const ProfileJS     = require('./../../profile/index');

module.exports = function (uid, count, callback) {
  
  // Если пользователь оналайн, берем профиль из пула
  let playerProfile = oPool.profiles[uid];
  
  if(playerProfile) {
    playerProfile.addPoints(count, callback);
    
    // Либо создаем
  } else {
    playerProfile = new ProfileJS();
    playerProfile.build(uid, (err) => {
      if(err) {
        return callback(err);
      }
      
      playerProfile.addPoints(count, callback);
    });
  }

};