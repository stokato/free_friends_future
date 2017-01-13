const Config      = require('./../../../config.json');
const constants   = require('../../constants');
const addAction   = require('./../lib/add_action');
const oPool       = require('./../../objects_pool');
const handleError = require('./../lib/handle_error');
const addPoints   = require('./../lib/add_points');
const stat        = require('./../../stat_manager');

const PF = constants.PFIELDS;
const MUTUAL_SYMPATHY_BONUS = Number(Config.points.game.mutual_sympathy);
const SYMPATHY_TIMEOUT = Number(Config.game.timeouts.sympathy_show);

// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function (timer, socket, options) {
  
    if(!timer) {
      let selfProfile = oPool.userList[socket.id];
      let uid = selfProfile.getID();
  
      // В игре симпатии нельзя указать себя
      if(game._nextGame == constants.G_SYMPATHY && uid == options[constants.PFIELDS.PICK]) {
        return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY, constants.errors.SELF_ILLEGAL);
      }
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      // В игре Симпатии нельзя выбрать несколько раз одного и того же игрока
      // И выбрать того, кого нет
      if(!game._activePlayers[options[constants.PFIELDS.PICK]]) {
        return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY, constants.errors.IS_ALREADY_SELECTED);
      }
  
      let actions = game._actionsQueue[uid];
  
      for( let i = 0; i < actions.length; i++) {
        if(actions[i][constants.PFIELDS.PICK] == options[constants.PFIELDS.PICK]) {
          return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY, constants.errors.FORBIDDEN_CHOICE);
        }
      }
  
      addAction(game, uid, options);
    }
  
    //---------------------------------------------------------------------------------
    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      // if(!game.checkCountPlayers()) {
      //   return game.stop();
      // }
      
      stat.setMainStat(constants.SFIELDS.SYMPATHY_ACITVITY, game.getActivityRating());
      
      let players = [], count = 0;
      
      for(let selfID in game._actionsQueue) if (game._actionsQueue.hasOwnProperty(selfID)) {
        let selfPicks = game._actionsQueue[selfID];
        
        for(let selfPickOptions = 0; selfPickOptions < selfPicks.length; selfPickOptions++) {
          let selfPick = selfPicks[selfPickOptions][PF.PICK];
          
          let otherPicks = game._actionsQueue[selfPick];
          if(otherPicks) {
            for(let otherPickOptions = 0; otherPickOptions < otherPicks.length; otherPickOptions++) {
              let otherPick = otherPicks[otherPickOptions][PF.PICK];
              if(otherPick && otherPick == selfID) {
                players.push(selfID);
              }
            }
          }
        }
      }
      
      if(players.length > 0) {
        addPoints(players[count], MUTUAL_SYMPATHY_BONUS, onComplete);
      }

      game._nextGame = constants.G_SYMPATHY_SHOW;

      // Сохраняем выбор игроков
      game._storedOptions = game._actionsQueue;

      // Очищаем настройки
      // game._activePlayers = {};
      game._actionsQueue = {};

      // Все игроки могут посмотреть результаты всех
      // game.activateAllPlayers();
      let countPrisoners = (game._prisoner === null)? 0 : 1;

      game.setActionLimit(game._currCountInRoom - 1 - countPrisoners);
      // game._actionsCount = (game._room.getCountInRoom(constants.GIRL)
      //             + game._room.getCountInRoom(constants.GUY) - countPrisoners) * 10;
      
      game._actionsCount = (game._currCountInRoom - countPrisoners) * 10;
      game._actionsMain = game._actionsCount;
      
      // Отправляем результаты
      let result = {
        [PF.NEXTGAME] : game._nextGame,
        [PF.PLAYERS]  : game.getPlayersID(),
        [PF.PRISON]   : null
      };
      
      
      if(game._prisoner !== null) {
        result[PF.PRISON] = {
          [PF.ID]  : game._prisoner.id,
          [PF.VID] : game._prisoner.vid,
          [PF.SEX] : game._prisoner.sex
        };
      }

      game.emit(result);

      // Сохраняем состояние игры
      game._gameState = result;

      // Устанавливаем таймер
      game.startTimer(game._handlers[game._nextGame], SYMPATHY_TIMEOUT);
    }
    
    //---------------------
    function onComplete(err) {
      if(err) { return new GameError(constants.G_SYMPATHY, err.message); }
    
      count++;
      if(count < players.length) {
        addPoints(players[count], MUTUAL_SYMPATHY_BONUS, onComplete);
      }
    }
  }
};