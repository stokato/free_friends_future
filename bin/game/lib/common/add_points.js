const oPool         = require('./../../../objects_pool'),
      ProfileJS     = require('./../../../profile/index');

/*
    Добавляем пользователю очки
  */
module.exports = function (uid, count, callback) {
  
  // Если пользователь оналайн, берем из пула
  let player = oPool.profiles[uid];
  
  if(player) {
    player.addPoints(count, callback);
    
    // Либо создаем
  } else {
    player = new ProfileJS();
    player.build(uid, function (err) {
      if(err) { return callback(err);  }
      
      player.addPoints(count, callback);
    });
  }

};