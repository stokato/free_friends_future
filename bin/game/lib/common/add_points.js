var constants     = require('./../../../constants'),
    oPool         = require('./../../../objects_pool'),
    ProfileJS     = require('./../../../profile/index'),
    GameError     = require('./game_error'),
    handleError   = require('./handle_error');

/*
    Добавляем пользователю очки
  */
module.exports = function (uid, count, callback) {
  
  // Если пользователь оналайн, берем из пула
  var player = oPool.profiles[uid];
  
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