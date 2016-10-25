var constants = require('../../../constants');
var oPool = require('./../../../objects_pool');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) { options = options || {};
    // Если обработчик вызван игроком а не таймером
    if(uid) {
      var selfProfile = oPool.profiles[uid];
      
      if(!selfProfile) { onComplete(new Error("Пользователь не онлайн")); }
      
      // Проверяем - хватает ли монет у того, кто выкупает
      selfProfile.getMoney(function(err, money) {
        if(err) { return callback(err); }
        
        var newMoney = money - constants.SYMPATHY_PRICE;
        
        if(newMoney < 0) {
          return; // onComplete(constants.errors.TOO_LITTLE_MONEY);
        }
        
        // Снимаем монеты
        selfProfile.setMoney(newMoney, function(err, money) {
          if(err) { return onComplete(err); }
          
          onPick();
        });
      });
      
      function onPick() {
        
        var result = {
          picks : []
        };
        
        // Получаем все его ходы игрока, о котором хочет узнать текущий и отправляем
        var pickedId, playerInfo, sympathy = game.gStoredOptions[options.pick];
        if(sympathy) {
          
          for(var i = 0; i < sympathy.length; i ++) {
            pickedId = sympathy[i].pick;
            
            playerInfo = game.gActivePlayers[options.pick];
            
            result.picks.push({
              id    : playerInfo.id,
              vid   : playerInfo.vid,
              pick  : {
                id    : pickedId,
                vid   : game.gActivePlayers[pickedId].vid
              }
            });
          }
        } else {
          result.picks.push({
            id    : options.pick,
            vid   : (options.pick)? game.gActivePlayers[options.pick].vid : null,
            pick  : null
          });
        }
        
        var socket = game.gActivePlayers[uid].player.getSocket();
        game.emit(result, socket);
      }
    }
  
    // После истечения времени на просмотр чужих симпатий переходим к следующему раунду
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }
    
      if(!game.checkCountPlayers()) {
        return game.stop();
      }
    
      game.restoreGame(null, true);
    }
    
    // После того, как все очки начислены, переходим к следующей игре
    function onComplete(err, res) {
      if(err) {
        console.log(err.message);
        return game.stop();
      }
      
      game.restoreGame(null, true);
    }
  }
};