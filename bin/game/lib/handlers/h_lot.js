/**
 * Волчек - выбор следующей игры
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */

const constants = require('../../../constants'),
  PF        = constants.PFIELDS,
  addAction = require('./../common/add_action'),
  oPool     = require('./../../../objects_pool');

const Config        = require('./../../../../config.json');

const DEF_TIMEOUT    = Number(Config.game.timeouts.default);
const BOTTLE_TIMEOUT = Number(Config.game.timeouts.bottle);
const PRISON_TIMEOUT = Number(Config.game.timeouts.prison);

module.exports = function(game) {
  return function(timer, socket, options) {
    
    let uid;
    game._currCountInRoom = game._room.getCountInRoom(constants.GIRL) + game._room.getCountInRoom(constants.GUY);
    
    // Если вызов произведени игроком - сохраняем его выбор
    if(!timer) {
      uid = oPool.userList[socket.id].getID();
      
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
      
      addAction(game, uid, options);
    }
    
    // Сбрасываем таймер
    clearTimeout(game._timer);
    
    let timeout = DEF_TIMEOUT;
    
    // Если игроков недостаточно - останавилваем игру
    if(!game.checkCountPlayers()) {
      return game.stop();
    }
    
    // Определяем следующую игру, если игроков слишком мало - то без тюрьмы
    let rand;
    let games = (game._prisoner !== null ||
    game._room.getCountInRoom(constants.GIRL) <= 2 ||
    game._room.getCountInRoom(constants.GUY) <= 2)?
      constants.GAMES_WITHOUT_PRISON : constants.GAMES;
    do {
      rand = Math.floor(Math.random() * games.length);
    } while(rand == game.gStoredRand);
    
    game.gStoredRand = rand;
    
    game._nextGame = games[rand];
    
    // Очищаем настройки
    game._actionsQueue = {};
    
    let result = {};
    result[PF.NEXTGAME] = game._nextGame;
    result[PF.PLAYERS] = [];
    
    let countPrisoners = (game._prisoner === null)? 0 : 1;
    
    switch (game._nextGame) {
      //-------------------------------- БУТЫЛОЧКА -----------------------------------------
      case constants.G_BOTTLE :    // для бутылочки ходит тот же, кто крутил волчек
        game._actionsCount = 1;
        game.setActionLimit(1);
        
        let player = null;
        for(let item in game._activePlayers) if (game._activePlayers.hasOwnProperty(item)) {
          player = game._activePlayers[item];
        }
        
        let sex = (player.sex == constants.GUY)? constants.GIRL : constants.GUY;
        
        let players = game._room.getAllPlayers(sex);
        let playersInfo = [];
        
        let prisonerID = null;
        if(game.getPrisonerInfo()) {
          prisonerID = game.getPrisonerInfo().id;
        }
        
        for(let i = 0 ; i < players.length; i++) {
          if(prisonerID != players[i].getID()) {
            playersInfo.push(game.getPlayerInfo(players[i]));
          }
        }
        
        game._storedOptions = playersInfo;
        
        timeout = BOTTLE_TIMEOUT;
        break;
      //--------------------------------- ВОПРОСЫ ------------------------------------------
      case constants.G_QUESTIONS : // для вопросов ходят все, отвечая на произовльный вопрос
        game._activePlayers = {};
        game.activateAllPlayers();
        
        game.setActionLimit(1);
        
        game._actionsCount = game._currCountInRoom - countPrisoners;
        game._actionsMain = game._actionsCount;
        
        result[PF.QUESTION] =  game.getRandomQuestion();
        break;
      //---------------------------------- КАРТЫ --------------------------------------------
      case constants.G_CARDS : // для карт ходят все
        game._activePlayers = {};
        game.activateAllPlayers();
        
        game.setActionLimit(1);
        
        game._actionsCount = game._currCountInRoom - countPrisoners;
        game._actionsMain = game._actionsCount;
        
        break;
      //---------------------------------- ЛУЧШИЙ --------------------------------------------
      case constants.G_BEST : // для игры Кто больше нравится выбираем произвольно пару к игроку того же пола
                              // ходят остальные
        let firstPlayer = null;
        if(uid) {
          firstPlayer = game._activePlayers[uid];
        } else {
          for(let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
            firstPlayer = game._activePlayers[item];
          }
        }
        
        // Получаем второго игрока
        let firstGender = firstPlayer.sex;
        
        let excludeIds = [firstPlayer.id];
        
        if(game.getPrisonerInfo()){
          excludeIds.push(game.getPrisonerInfo().id);
        }
        
        if(game.getPrisonerInfo()) {
          excludeIds.push(game.getPrisonerInfo().id);
        }
        
        let randPlayer = game._room.randomProfile(firstGender, excludeIds);
        
        if(!randPlayer) {
          return game.stop();
        }
        
        // Получаем сведения
        let secondPlayer = game.getPlayerInfo(randPlayer);
        
        let bestPlayers = [firstPlayer.id, secondPlayer.id];
        let best1 = {
          [PF.ID]  : firstPlayer.id,
          [PF.VID] : firstPlayer.vid,
          [PF.SEX] : firstPlayer.sex
        };
        
        let best2 = {
          [PF.ID]  : secondPlayer.id,
          [PF.VID] : secondPlayer.vid,
          [PF.SEX] : secondPlayer.sex
        };

        
        let bestPlayerInfo = [best1, best2];
        
        // Сохраняем опции
        game._storedOptions = {};
        game._storedOptions[firstPlayer.id] = firstPlayer;
        game._storedOptions[secondPlayer.id] = secondPlayer;
        
        // Ходят все оставшиеся игроки по разу
        game._activePlayers = {};
        game.activateAllPlayers(bestPlayers);
        
        game.setActionLimit(1);
        game._actionsCount = game._currCountInRoom - countPrisoners - 2;
        game._actionsMain = game._actionsCount;
        
        result.best = bestPlayerInfo;
        break;
      //------------------------------------ СИМПАТИИ -----------------------------------
      case constants.G_SYMPATHY: // Ходяв все игроки по 2 раза
        game._activePlayers = {};
        game.activateAllPlayers();
        
        game.setActionLimit(Config.game.show_sympathy_limit);
        game._actionsCount = (game._currCountInRoom - countPrisoners) * 2;
        game._actionsMain = game._actionsCount;
        
        break;
      //------------------------------------- ТЮРЬМА ------------------------------------
      case constants.G_PRISON: // По истечении таймаута, добавляем в тюрьму
        
        timeout = PRISON_TIMEOUT;
        break;
    }
    // -----------------------------------------------------------------------------------
    result.players = game.getPlayersID();
        
    // Добавляем данные об игроке в темнице и отправляем результаты игрокам
    if(game._prisoner !== null) {
      
      result[PF.PRISON] = {
        [PF.ID]  : game._prisoner.id,
        [PF.VID] : game._prisoner.vid,
        [PF.SEX] : game._prisoner.sex
      };

    } else {
      result[PF.PRISON] = null;
    }
    
    game.emit(result);
    game._gameState = result;
    
    // Устанавливаем таймаут
    game.startTimer(game._handlers[game._nextGame], timeout);
  }
};
