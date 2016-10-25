var constants = require('../../../constants');

// Выбор следующей игры
module.exports = function(game) {
  return function(timer, uid) {
    clearTimeout(game.gTimer);

    var timeout = constants.TIMEOUT_GAME;

    if(!game.checkCountPlayers()) {
      return game.stop();
    }

    // Определяем следующую игру, если игроков слишком мало - то без тюрьмы
    var rand;
    var games = (game.gPrisoner !== null ||
                  game.gRoom.girls_count <= 2 ||
                    game.gRoom.guys_count <= 2)? constants.GAMES_WITHOUT_PRISON : constants.GAMES;

    do {
      rand = Math.floor(Math.random() * games.length);
    } while(rand == game.gStoredRand);

    game.gStoredRand = rand;

    game.gNextGame = games[rand];
    
    game.gNextGame = constants.G_SYMPATHY;


    // Очищаем настройки
    game.gActionsQueue = {};

    var result = {
      next_game    : game.gNextGame,
      players      : []
    };

    var countPrisoners = (game.gPrisoner === null)? 0 : 1;

    switch (game.gNextGame) {
      /////////////////////// БУТЫЛОЧКА //////////////////////////////////////////
      case constants.G_BOTTLE :    // для бутылочки ходит тот же, кто крутил вочек
        game.gActionsCount = 1;
        game.setActionLimit(1);
        break;
      ////////////////////// ВОПРОСЫ ////////////////////////////////////////////////////
      case constants.G_QUESTIONS : // для вопросов ходят все, отвечая на произовльный вопрос
        game.gActivePlayers = {};
        game.activateAllPlayers();

        game.setActionLimit(1);

        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners;

        result.question =  game.getRandomQuestion();
        break;
      ////////////////////// КАРТЫ /////////////////////////////////////////////////////
      case constants.G_CARDS : // для карт ходят все
        game.gActivePlayers = {};
        game.activateAllPlayers();

        game.setActionLimit(1);

        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners;
        break;
      //////////////////// ЛУЧШИЙ ///////////////////////////////////////////////////////
      case constants.G_BEST : // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходят остальные

        var firstPlayer = null;
        if(uid) {
          firstPlayer = game.gActivePlayers[uid];
        } else {
          for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
            firstPlayer = game.gActivePlayers[item];
          }
        }

        // Получаем второго игрока
        var firstGender = firstPlayer.sex;
        var randPlayer = game.getRandomPlayer(firstGender, [firstPlayer.id]);

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
        game.gStoredOptions = {};
        game.gStoredOptions[firstPlayer.id] = firstPlayer;
        game.gStoredOptions[secondPlayer.id] = secondPlayer;

        // Ходяв все оставшиеся игроки по разу
        game.gActivePlayers = {};
        game.activateAllPlayers(bestPlayers);

        game.setActionLimit(1);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners;

        result.best = bestPlayerInfo;
        break;
      //////////////////// СИМПАТИИ ///////////////////////////////////////////////////////
      case constants.G_SYMPATHY:          // Ходяв все игроки по 2 раза
        game.gActivePlayers = {};
        game.activateAllPlayers();

        game.setActionLimit(constants.SHOW_SYMPATHY_LIMIT);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners;
        break;
      //////////////////// ТЮРЬМА ///////////////////////////////////////////////////////
      case constants.G_PRISON:           // По истечении таймаута, добавляем в тюрьму

        //game.gActionsCount = 1;
        //game.setActionLimit(1);

        timeout = constants.TIMEOUT_PRISON;
        break;
    }
    /////////////////////////////////////////////////////////////////////////////////////
    result.players = game.getPlayersID();


    // Добавляем данные об игроке в темнице и отправляем результаты игрокам
    if(game.gPrisoner !== null) {
      result.prison = {
        id : game.gPrisoner.id,
        vid: game.gPrisoner.vid,
        sex: game.gPrisoner.sex
      }
    } else {
      result.prison = null;
    }

    game.emit(result);
    game.gameState = result;

    // Устанавливаем таймаут
    game.startTimer(game.gHandlers[game.gNextGame], timeout);
  }
};
