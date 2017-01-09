const constants   = require('../../../constants');
const addAction   = require('./../common/add_action');
const oPool       = require('./../../../objects_pool');
const GameError   = require('./../common/game_error');
const handleError = require('../common/handle_error');
const Config      = require('./../../../../config.json');

const SYMPATHY_PRICE  = Number(Config.moneys.sympathy_price);
const WASTE_POINTS    = Number(Config.points.waste);
const PF              = constants.PFIELDS;

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, socket, options) { options = options || {};
    
    if(!timer) {
      let selfProfile = oPool.userList[socket.id];
      let uid = selfProfile.getID();
      
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
      
      let actions = game._actionsQueue[uid];
      
      for( let i = 0; i < actions.length; i++) {
        if(actions[i][constants.PFIELDS.PICK] == options[constants.PFIELDS.PICK]) {
          return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY_SHOW, constants.errors.FORBIDDEN_CHOICE);
        }
      }
      
      addAction(game, uid, options);
      
      // Если обработчик вызван игроком а не таймером
      selfProfile.pay(SYMPATHY_PRICE, function (err, money) {
        if(err) { return onError(err, selfProfile);  }
        
        // let res = {};
        // res[PF.MONEY] = money;
        //
        // let socket = selfProfile.getSocket();
        // socket.emit(constants.IO_GET_MONEY, res);
        
        selfProfile.addPoints(WASTE_POINTS * SYMPATHY_PRICE, function (err, points) {
          if(err) { return onError(err, selfProfile);  }
  
          // let res = {};
          // res[constants.PFIELDS.POINTS] = points;
          //
          // socket.emit(constants.IO_ADD_POINTS, res);
          
          onPick();
        });
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
    
      let result = {
        [PF.PICKS] : []
      };
    
      // Получаем все его ходы игрока, о котором хочет узнать текущий и отправляем
      let pickedId, playerInfo, sympathy = game._storedOptions[options[PF.PICK]];
      if(sympathy) {
      
        for(let i = 0; i < sympathy.length; i ++) {
          pickedId = sympathy[i].pick;
        
          playerInfo = game._activePlayers[options[PF.PICK]];
  
          let pick = {
            [PF.ID]   : playerInfo.id,
            [PF.VID]  : playerInfo.vid,
            [PF.PICK] : {
              [PF.ID]   : pickedId,
              [PF.VID]  : game._activePlayers[pickedId].vid
            }
          };
        
          result[PF.PICKS].push(pick);
        }
      } else {
        let pick = {
          [PF.ID]   : options[PF.PICK],
          [PF.VID]  : (options[PF.PICK])? game._activePlayers[options[PF.PICK]].vid : null,
          [PF.PICK] : null
        };
      
        result[PF.PICKS].push(pick);
      }
    
      let socket = game._activePlayers[uid].player.getSocket();
      game.emit(result, socket);
    }
  
    // После того, как все очки начислены, переходим к следующей игре
    function onError(err, player) {
      if(err) {
        new GameError(constants.G_SYMPATHY_SHOW, err.message);
      
        if(player) {
          let socket = player.getSocket();
        
          if(socket) {
            handleError(socket, constants.IO_GAME_ERROR, game._nextGame, err);
          }
        }
      
        //return game.stop();
      }
    
    }
  }
};