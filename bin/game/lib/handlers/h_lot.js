var constants = require('../../constants_game');


var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players');

module.exports = function(game) {
  return function(timer, uid) {
    var rand;
    clearTimeout(game.currTimer);
    rand = randomInteger(0, constants.GAMES.length - 1);
    game.nextGame = constants.GAMES[rand];

    game.actionsQueue = {};

    var result = { game : game.nextGame };
    if(game.nextGame == 'bottle') {  // для бутылочки ходит тот же, кто крутил вочек
      game.countActions = 1;
      result[players] =  getPlayersID(game.currPlayers);
      game.emit(result);
    }
    if(game.nextGame == 'questions') { // для вопросов ходят все, отвечая на произовльный вопрос
      game.currPlayers = [];
      game.countActions = constants.PLAYERS_COUNT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      rand = randomInteger(0, constants.GAME_QUESTIONS.length - 1);
      result['question'] =  constants.GAME_QUESTIONS[rand];
      result['players'] = getPlayersID(game.currPlayers);
      game.emit(result);
    }
    if(game.nextGame == 'cards') { // для карт ходят все
      game.currPlayers = {};
      game.countActions = constants.PLAYERS_COUNT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      result['players'] = getPlayersID(game.currPlayers);
      game.emit(result);
    }
    if(game.nextGame == 'best') { // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходят остальные
      var firstGender = game.currPlayers[uid].getSex();
      var secondGender = (firstGender == 'guy') ? 'girl' : 'guy';
      var player = randomPlayer(game.gRoom, secondGender);
      var arr = [];
      arr.push(game.currPlayers[uid].getID());
      arr.push(player.getID());

      game.countActions = constants.PLAYERS_COUNT-2;
      pushAllPlayers(game.gRoom, game.currPlayers, arr);
      result['players'] = getPlayersID(game.currPlayers);
      result['best'] = arr;
      game.emit(result);
    }
    if(game.nextGame == 'sympathy') { // для игры "симпатия" ходят все
      game.countActions = constants.PLAYERS_COUNT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      result['players'] = getPlayersID(game.currPlayers);
      game.emit(result);
    }
    game.currTimer = startTimer(game.handlers[game.nextGame]);
  }
};

// Получить случайное число из диапазона
function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}