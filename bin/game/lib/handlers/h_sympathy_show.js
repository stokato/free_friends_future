var constants = require('../../../constants'),
  PF = constants.PFIELDS;
var addAction = require('./../common/add_action');
var oPool = require('./../../../objects_pool');
var GameError = require('./../common/game_error');
var handleError = require('../common/handle_error');
var Config        = require('./../../../../config.json');

var SYMPATHY_PRICE = Number(Config.moneys.sympathy_price);

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, socket, options) { options = options || {};
    
    if(!timer) {
      var selfProfile = oPool.userList[socket.id];
      var uid = selfProfile.getID();
      
      if(game._nextGame == constants.G_SYMPATHY_SHOW && uid == options[constants.PFIELDS.PICK]) {
        return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY_SHOW, constants.errors.SELF_ILLEGAL);
      }
      
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
      
      // В игре Симпатии нельзя выбрать несколько раз одного и того же игрока
      // И выбрать того, кого нет
      if(!game._activePlayers[options[constants.PFIELDS.PICK]]) {
        return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY_SHOW, constants.errors.IS_ALREADY_SELECTED);
      }
      
      var actions = game._actionsQueue[uid];
      
      for( var i = 0; i < actions.length; i++) {
        if(actions[i][constants.PFIELDS.PICK] == options[constants.PFIELDS.PICK]) {
          return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY_SHOW, constants.errors.FORBIDDEN_CHOICE);
        }
      }
      
      addAction(game, uid, options);
      
      // Если обработчик вызван игроком а не таймером
      selfProfile.pay(SYMPATHY_PRICE, function (err, money) {
        if(err) { return onError(err, selfProfile);  }
        
        var res = {};
        res[PF.MONEY] = money;
        
        var socket = selfProfile.getSocket();
        socket.emit(constants.IO_GET_MONEY, res);
        
        onPick();
      });
    }
    
    //--------------------------------------------------------------------------------
    // После истечения времени на просмотр чужих симпатий переходим к следующему раунду
    if(game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }
      
      if(!game.checkCountPlayers()) {
        return game.stop();
      }
      
      game.restoreGame(null, false);
    }
  
    //-----------------------------------------------------------------------------------
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
        
          result[PF.PICKS].push(pick);
        }
      } else {
        pick[PF.ID] = options[PF.PICK];
        pick[PF.VID] = (options[PF.PICK])? game._activePlayers[options[PF.PICK]].vid : null;
        pick[PF.PICK] = null;
      
        result[PF.PICKS].push(pick);
      }
    
      var socket = game._activePlayers[uid].player.getSocket();
      game.emit(result, socket);
    }
  
    // После того, как все очки начислены, переходим к следующей игре
    function onError(err, player) {
      if(err) {
        new GameError(constants.G_SYMPATHY_SHOW, err.message);
      
        if(player) {
          var socket = player.getSocket();
        
          if(socket) {
            handleError(socket, constants.IO_GAME_ERROR, game._nextGame, err);
          }
        }
      
        return; // game.stop();
      }
    
    }
  }
};