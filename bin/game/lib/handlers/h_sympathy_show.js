var constants = require('../../../constants'),
    PF = constants.PFIELDS;
var oPool = require('./../../../objects_pool');
var GameError = require('./../common/game_error');
var handleError = require('../common/handle_error');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) { options = options || {};
    // Если обработчик вызван игроком а не таймером
    if(uid) {
      var selfProfile = oPool.profiles[uid];
      
      if(!selfProfile) { onError(new Error("Пользователь не онлайн")); }
      
      selfProfile.pay(constants.SYMPATHY_PRICE, function (err, money) {
        if(err) { return onError(err, selfProfile);  }
  
        var res = {};
        res[PF.MONEY] = money;
        
        var socket = selfProfile.getSocket();
        socket.emit(constants.IO_GET_MONEY, res);
        
        onPick();
      });
      
      function onPick() {
        
        var result = {}, pick = {};
        result[PF.PICKS] = [];
        
        // Получаем все его ходы игрока, о котором хочет узнать текущий и отправляем
        var pickedId, playerInfo, sympathy = game._storedOptions[options[PF.PICK]];
        if(sympathy) {
          
          for(var i = 0; i < sympathy.length; i ++) {
            pickedId = sympathy[i].pick;
            
            playerInfo = game._activePlayers[options[PF.PICK]];
            
            pick = {};
            pick[PF.ID] = playerInfo.id;
            pick[PF.VID] = playerInfo.vid;
            pick[PF.PICK] = {};
            pick[PF.PICK][PF.ID] = pickedId;
            pick[PF.PICK][PF.VID] = game._activePlayers[pickedId].vid;
            
            result[PF.PICK].push(pick);
          }
        } else {
          pick[PF.ID] = options[PF.PICK];
          pick[PF.VID] = (options[PF.PICK])? game._activePlayers[options[PF.PICK]].vid : null;
          pick[PF.PICK] = null;
          
          result[PF.PICK].push(pick);
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