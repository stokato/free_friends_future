var constants = require('./../../../constants');

var oPool = require('./../../../objects_pool');
var ProfileJS = require('./../../../profile/index');

var handleError = require('../../../handle_error');
var GameError = require('./../../../game_error');

// Добавляем пользователю очки
module.exports = function (uid, count, callback) {
  
  var player = oPool.profiles[uid];
  
  if(player) {
    player.addPoints(count, onPoints(player));
  } else {
    player = new ProfileJS();
    player.build(uid, function (err, info) {
      if(err) { return callback(err);  }
      
      player.addPoints(count, onPoints(player));
    });
  }
  
  // Функция обрабатывает результы начисления очков, оповещает игрока
  function onPoints(player) {
    return function(err, res) {
      var socket = player.getSocket();
      
      if(err) {
        if(socket) {
          handleError(socket, constants.IO_GAME_ERROR, err);
        } else {
          new GameError(constants.IO_GAME_ERROR, err.message);
        }
        
        return callback(err);
      }
      
      socket.emit(constants.IO_ADD_POINTS, { points : res });
      
      callback(null, null);
    }
  }
};