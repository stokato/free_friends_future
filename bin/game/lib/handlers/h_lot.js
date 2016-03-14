var constants = require('../../constants_game');


var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players'),
    setAnswersLimit = require('../set_answers_limits');

module.exports = function(game) {
  return function(socket, timer, uid) {
    var rand;
    clearTimeout(game.currTimer);
    rand = randomInteger(0, constants.GAMES.length - 1);
    game.nextGame = constants.GAMES[rand];

    game.actionsQueue = {};

    var result = { game : game.nextGame, players: null };
    if(game.nextGame == 'bottle') {  // для бутылочки ходит тот же, кто крутил вочек
      game.countActions = 1;
      result.players =  getPlayersID(game.currPlayers);
      setAnswersLimit(game, 1);
    }
    if(game.nextGame == 'questions') { // для вопросов ходят все, отвечая на произовльный вопрос
      game.currPlayers = {};
      game.countActions = constants.PLAYERS_COUNT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, 1);
      rand = randomInteger(0, constants.GAME_QUESTIONS.length - 1);
      result['question'] =  constants.GAME_QUESTIONS[rand];
      result['players'] = getPlayersID(game.currPlayers);
    }
    if(game.nextGame == 'cards') { // для карт ходят все
      game.currPlayers = {};
      game.countActions = constants.PLAYERS_COUNT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, 1);
      result['players'] = getPlayersID(game.currPlayers);
    }
    if(game.nextGame == 'best') { // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходят остальные
      var firstPlayer;
      if(uid) {
        firstPlayer = game.currPlayers[uid];
      } else {
        firstPlayer = randomPlayer(game.gRoom);
      }
      var firstGender = firstPlayer.getSex();
      //var secondGender = (firstGender == 2) ? 1 : 2;
      var player = randomPlayer(game.gRoom, firstGender, [firstPlayer.getID()]);
      var arr = [];
      arr.push(firstPlayer.getID());
      arr.push(player.getID());

      game.storedOptions = {};
      game.storedOptions[firstPlayer.getID()] = firstPlayer;
      game.storedOptions[player.getID] = player;

      game.countActions = constants.PLAYERS_COUNT-2;
      game.currPlayers = {};
      pushAllPlayers(game.gRoom, game.currPlayers, arr);
      setAnswersLimit(game, 1);
      result['players'] = getPlayersID(game.currPlayers);
      result['best'] = arr;
    }
    if(game.nextGame == 'sympathy') { // для игры "симпатия" ходят все
      game.countActions = constants.PLAYERS_COUNT * constants.SHOW_SYMPATHY_LIMIT;
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, constants.SHOW_SYMPATHY_LIMIT);
      result['players'] = getPlayersID(game.currPlayers);
    }
    game.emit(socket, result);
    game.currTimer = startTimer(game.pSocket, game.handlers[game.nextGame]);
  }
};

// Получить случайное число из диапазона
function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}