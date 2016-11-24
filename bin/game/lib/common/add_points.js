var constants     = require('./../../../constants'),
    oPool         = require('./../../../objects_pool'),
    ProfileJS     = require('./../../../profile/index'),
    GameError     = require('./game_error'),
    handleError   = require('handle_error');

/*
    Добавляем пользователю очки
  */
module.exports = function (uid, count, callback) {
  
  // Если пользователь оналайн, берем из пула
  var player = oPool.profiles[uid];
  
  if(player) {
    player.addPoints(count, onPoints(player));
    
    // Либо создаем
  } else {
    player = new ProfileJS();
    player.build(uid, function (err) {
      if(err) { return callback(err);  }
      
      player.addPoints(count, onPoints(player));
    });
  }
  
  // Функция обрабатывает результы начисления очков, оповещает игрока
  function onPoints(player) {
    return function(err, points) {
      var socket = player.getSocket();
      
      if(err) {
        if(socket) {
          handleError(socket, constants.IO_GAME_ERROR, err);
        } else {
          new GameError(constants.IO_GAME_ERROR, err.message);
        }
        
        return callback(err);
      }
      
      var res = {};
      res[constants.PFIELDS.POINTS] = points;
      
      socket.emit(constants.IO_ADD_POINTS, res);
      
      callback(null, null);
    }
  }
};