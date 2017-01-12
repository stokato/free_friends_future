/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config      = require('../../../../../config.json');
const constants   = require('../../../../constants');
const oPool       = require('../../../../objects_pool');
const GameError   = require('../../common/game_error');

const addAction           = require('../../common/add_action');
const handleError         = require('../../common/handle_error');
const finishSympathyShow  = require('../finishers/f_sympathy_show');

const PF                = constants.PFIELDS;
const SYMPATHY_TIMEOUT  = Number(Config.game.timeouts.sympathy_show);
const SYMPATHY_PRICE    = Number(Config.moneys.sympathy_price);
const WASTE_POINTS      = Number(Config.points.waste);

module.exports = function (game) {
  
  game._nextGame = constants.G_SYMPATHY_SHOW;
  
  // Очищаем настройки
  game._actionsQueue = {};
  
  // Все игроки могут посмотреть результаты всех
  let countPrisoners = (game._prisoner === null)? 0 : 1;
  
  game.setActionLimit(game._currCountInRoom - 1 - countPrisoners);

  game._actionsCount = (game._currCountInRoom - countPrisoners) * 10;
  game._actionsMain = game._actionsCount;
  
  // Отправляем результаты
  let result = {
    [PF.NEXTGAME] : game._nextGame,
    [PF.PLAYERS]  : game.getPlayersID(),
    [PF.PRISON]   : null
  };
  
  
  game.checkPrisoner(result);
  
  game.emit(result);
  
  // Сохраняем состояние игры
  game._gameState = result;
  
  // Устанавливаем таймер
  game.startTimer(finishSympathyShow, SYMPATHY_TIMEOUT, game);

 game._onGame = function (socket, options) {
  
   let selfProfile = oPool.userList[socket.id];
   uid = selfProfile.getID();
  
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
    
    
     selfProfile.addPoints(WASTE_POINTS * SYMPATHY_PRICE, function (err, points) {
       if(err) { return onError(err, selfProfile);  }
      
       onPick(options);
     });
   });
  
   if(game._actionsCount == 0) {
     finishSympathyShow(false, game);
   }
 };
  
  //-----------------------------------------------------------------------------------
  function onPick(options) {
    
    let result = { [PF.PICKS] : [] };
    
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
};