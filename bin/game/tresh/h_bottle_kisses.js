/**
 * Бутылочка поцелуи, сообщаем всем выбор пары, если оба поцеловали - наисляем им очки
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */

const GameError = require('./../lib/game_error'),
  constants = require('../../constants'),
  PF        = constants.PFIELDS,
  addPoints = require('./../lib/add_points'),
  addAction = require('./../lib/add_action'),
  oPool = require('./../../objects_pool'),
  stat  = require('./../../stat_manager');

const Config        = require('./../../../config.json');
const KISS_POINTS = Number(Config.points.game.mutual_kiss);

module.exports = function(game) {
  return function (timer, socket, options) {
    
    let item;
    
    // Если вызов произведен игроком - сохраняем его выбор и всех оповещаем
    if(!timer) {
      let uid = oPool.userList[socket.id].getID();
      
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
      addAction(game, uid, options);
  
      // Статистика
      for(item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        let profInfo  = game._activePlayers[item];
        if(uid != profInfo.id && options[PF.PICK] == true) {
          stat.setUserStat(profInfo.id, profInfo.vid, constants.SFIELDS.BOTTLE_KISSED, 1);
        }
      }
      
      // Отправляем всем выбор игрока
      let playerInfo = game._activePlayers[uid];
      
      let result = {};
      result[PF.ID] = uid;
      result[PF.VID] = playerInfo.vid;
      result[PF.PICK] = options[PF.PICK];
      
      game.emit(result);
      
      if(!game._gameState[PF.PICKS]) { game._gameState[PF.PICKS] = []; }
      game._gameState[PF.PICKS].push(result);
    }
    
    //------------------------------------------------------------------------------------
    // Если все игроки сделали выбор, проверяем - оба ли поцеловали
    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }
      
      // Если игроков недостаточно - останавливаме игру
      // if(!game.checkCountPlayers()) {
      //   return game.stop();
      // }
      
      let count = 0, players = [];
      
      let allKissed = true;
      for(item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        let pInf  = game._activePlayers[item];
        if(!game._actionsQueue[pInf.id] || !game._actionsQueue[pInf.id][0][PF.PICK] === true) {
          allKissed = false;
        }
      }
      
      // Если оба поцеловали друг друга, нужно добавить им очки, получаем данные игроков
      if(allKissed) {
        for(item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
          players.push(game._activePlayers[item]);
        } // и начесляем очки
        addPoints(players[count].id, KISS_POINTS, onComplete);
      }
      
      stat.setMainStat(constants.SFIELDS.BOTTLE_ACTIVITY, game.getActivityRating());
      
      game.restoreGame(null, true);
    }
    
    //----------------
    function onComplete(err) {
      if(err) { return new GameError(constants.G_BOTTLE_KISSES, err.message); }
      
      count++;
      if(count < players.length) {
        addPoints(players[count].id, KISS_POINTS, onComplete);
      }
    }
    
  }
};


