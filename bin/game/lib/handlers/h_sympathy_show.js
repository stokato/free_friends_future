var constants = require('../../../constants');
var oPool = require('./../../../objects_pool');
var GameError = require('./../../../game_error');
var handleError = require('../../../handle_error');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) { options = options || {};
    // Если обработчик вызван игроком а не таймером
    if(uid) {
      var selfProfile = oPool.profiles[uid];
      
      if(!selfProfile) { onError(new Error("Пользователь не онлайн")); }
      
      selfProfile.pay(constants.SYMPATHY_PRICE, function (err, money) {
        if(err) { return onError(err, selfProfile);  }
  
        var socket = selfProfile.getSocket();
        socket.emit(constants.IO_GET_MONEY, { money : money });
        
        onPick();
      });
      
      function onPick() {
        
        var result = {
          picks : []
        };
        
        // Получаем все его ходы игрока, о котором хочет узнать текущий и отправляем
        var pickedId, playerInfo, sympathy = game._storedOptions[options.pick];
        if(sympathy) {
          
          for(var i = 0; i < sympathy.length; i ++) {
            pickedId = sympathy[i].pick;
            
            playerInfo = game._activePlayers[options.pick];
            
            result.picks.push({
              id    : playerInfo.id,
              vid   : playerInfo.vid,
              pick  : {
                id    : pickedId,
                vid   : game._activePlayers[pickedId].vid
              }
            });
          }
        } else {
          result.picks.push({
            id    : options.pick,
            vid   : (options.pick)? game._activePlayers[options.pick].vid : null,
            pick  : null
          });
        }
        
        var socket = game._activePlayers[uid].player.getSocket();
        game.emit(result, socket);
      }
    }
  
    // После истечения времени на просмотр чужих симпатий переходим к следующему раунду
    if(game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }
    
      if(!game.checkCountPlayers()) {
        return game.stop();
      }
    
      game.restoreGame(null, false);
    }
    
    // После того, как все очки начислены, переходим к следующей игре
    function onError(err, player) {
      if(err) {
        new GameError(constants.G_SYMPATHY_SHOW, err.message);
        
        if(player) {
          var socket = player.getSocket();
          
          if(socket) {
            handleError(socket, constants.IO_GAME_ERROR, err);
          }
        }
        
        return; // game.stop();
      }

    }
  }
};