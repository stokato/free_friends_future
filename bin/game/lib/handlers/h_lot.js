var constants = require('../../../constants');

// Выбор следующей игры
module.exports = function(game) {
  return function(timer, uid) {
    clearTimeout(game._timer);

    var timeout = constants.TIMEOUT_GAME;

    if(!game.checkCountPlayers()) {
      return game.stop();
    }

    // Определяем следующую игру, если игроков слишком мало - то без тюрьмы
    var rand;
    var games = (game._prisoner !== null ||
                  game._room.getCountInRoom(constants.GIRL) <= 2 ||
                    game._room.getCountInRoom(constants.GUY) <= 2)? constants.GAMES_WITHOUT_PRISON : constants.GAMES;

    do {
      rand = Math.floor(Math.random() * games.length);
    } while(rand == game.gStoredRand);

    game.gStoredRand = rand;

    game._nextGame = games[rand];
    
    // Очищаем настройки
    game._actionsQueue = {};

    var result = {
      next_game    : game._nextGame,
      players      : []
    };

    var countPrisoners = (game._prisoner === null)? 0 : 1;

    switch (game._nextGame) {
      /////////////////////// БУТЫЛОЧКА //////////////////////////////////////////
      case constants.G_BOTTLE :    // для бутылочки ходит тот же, кто крутил вочек
        game._actionsCount = 1;
        game.setActionLimit(1);
        
        timeout = constants.TIMEOUT_BOTTLE;
        break;
      ////////////////////// ВОПРОСЫ ////////////////////////////////////////////////////
      case constants.G_QUESTIONS : // для вопросов ходят все, отвечая на произовльный вопрос
        game._activePlayers = {};
        game.activateAllPlayers();

        game.setActionLimit(1);

        game._actionsCount = game._room.getCountInRoom(constants.GIRL)
                                  + game._room.getCountInRoom(constants.GUY) - countPrisoners;

        result.question =  game.getRandomQuestion();
        break;
      ////////////////////// КАРТЫ /////////////////////////////////////////////////////
      case constants.G_CARDS : // для карт ходят все
        game._activePlayers = {};
        game.activateAllPlayers();

        game.setActionLimit(1);

        game._actionsCount = game._room.getCountInRoom(constants.GIRL)
                                + game._room.getCountInRoom(constants.GUY) - countPrisoners;
        break;
      //////////////////// ЛУЧШИЙ ///////////////////////////////////////////////////////
      case constants.G_BEST : // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходят остальные

        var firstPlayer = null;
        if(uid) {
          firstPlayer = game._activePlayers[uid];
        } else {
          for(var item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
            firstPlayer = game._activePlayers[item];
          }
        }

        // Получаем второго игрока
        var firstGender = firstPlayer.sex;
        
        var excludeIds = [firstPlayer.id];
        
        if(game.getPrisonerInfo()) {
          excludeIds.push(game.getPrisonerInfo().id);
        }
        
        var randPlayer = game._room.randomProfile(firstGender, excludeIds);

        if(!randPlayer) {
          return game.stop();
        }

        var secondPlayer = game.getPlayerInfo(randPlayer);

        var bestPlayers = [firstPlayer.id, secondPlayer.id];
        var bestPlayerInfo = [{
          id  : firstPlayer.id,
          vid : firstPlayer.vid,
          sex : firstPlayer.sex
        }, {
          id  : secondPlayer.id,
          vid : secondPlayer.vid,
          sex : secondPlayer.sex
        }];

        // Сохраняем опции
        game._storedOptions = {};
        game._storedOptions[firstPlayer.id] = firstPlayer;
        game._storedOptions[secondPlayer.id] = secondPlayer;

        // Ходяв все оставшиеся игроки по разу
        game._activePlayers = {};
        game.activateAllPlayers(bestPlayers);

        game.setActionLimit(1);
        game._actionsCount = game._room.getCountInRoom(constants.GIRL)
                              + game._room.getCountInRoom(constants.GUY) - countPrisoners - 2;

        result.best = bestPlayerInfo;
        break;
      //////////////////// СИМПАТИИ ///////////////////////////////////////////////////////
      case constants.G_SYMPATHY:          // Ходяв все игроки по 2 раза
        game._activePlayers = {};
        game.activateAllPlayers();

        game.setActionLimit(constants.SHOW_SYMPATHY_LIMIT);
        game._actionsCount = (game._room.getCountInRoom(constants.GIRL)
                                + game._room.getCountInRoom(constants.GUY) - countPrisoners) * 2;
        break;
      //////////////////// ТЮРЬМА ///////////////////////////////////////////////////////
      case constants.G_PRISON:           // По истечении таймаута, добавляем в тюрьму

        //game._actionsCount = 1;
        //game.setActionLimit(1);

        timeout = constants.TIMEOUT_PRISON;
        break;
    }
    /////////////////////////////////////////////////////////////////////////////////////
    result.players = game.getPlayersID();


    // Добавляем данные об игроке в темнице и отправляем результаты игрокам
    if(game._prisoner !== null) {
      result.prison = {
        id : game._prisoner.id,
        vid: game._prisoner.vid,
        sex: game._prisoner.sex
      }
    } else {
      result.prison = null;
    }

    game.emit(result);
    game._gameState = result;

    // Устанавливаем таймаут
    game.startTimer(game._handlers[game._nextGame], timeout);
  }
};
