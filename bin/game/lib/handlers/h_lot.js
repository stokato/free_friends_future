var constants = require('../../constants_game');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players');

module.exports = function(game) {
  return function() {
    var rand;
    clearTimeout(game.currTimer);
    rand = randomInteger(0, constants.GAMES.length - 1);
    game.nextGame = constants.GAMES[rand];

    game.actionsQueue = {};

    var options = { game : game.nextGame };
    if(game.nextGame == 'bottle') {  // для бутылочки ходит тот же, кто крутил вочек
      game.countActions = 1;
      options[players] =  getPlayersID(game.currPlayers);
      game.emit(options);
    }
    if(game.nextGame == 'questions') { // для вопросов ходят все, отвечая на произовльный вопрос
      game.currPlayers = [];
      game.countActions = constants.PLAYERS_COUNT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      rand = randomInteger(0, constants.GAME_QUESTIONS.length - 1);
      options['question'] =  constants.GAME_QUESTIONS[rand];
      options['players'] = getPlayersID(game.currPlayers);
      game.emit(options);
    }
    if(game.nextGame == 'cards') { // для карт ходят все
      game.currPlayers = [];
      game.countActions = constants.PLAYERS_COUNT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      options['players'] = getPlayersID(game.currPlayers);
      game.emit(options);
    }
    if(game.nextGame == 'best') { // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходя остальные
      var player = randomPlayer(game.gRoom, game.currPlayers[0].getSex());
      var arr = [];
      arr.push(game.currPlayers[0].getID());
      arr.push(player.getID());

      game.countActions = constants.PLAYERS_COUNT-2;
      pushAllPlayers(game.gRoom, game.currPlayers, arr);
      options['players'] = getPlayersID(game.currPlayers);
      options['best'] = arr;
      game.emit(options);
    }
    if(game.nextGame == 'sympathy') { // для игры "симпатия" ходят все
      game.countActions = constants.PLAYERS_COUNT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      options['players'] = getPlayersID(game.currPlayers);
      game.emit(options);
    }
    game.currTimer = startTimer(game.handlers[game.nextGame], game.countActions);
  }
};

// Получить случайное число из диапазона
function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}