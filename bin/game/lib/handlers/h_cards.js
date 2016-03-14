var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input');
var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players'),
    setAnswersLimit = require('../set_answers_limits');

// Карты, ждем, кода все ответят, потом показываем всем их ответы и где золото
module.exports = function(game) {
  return function (socket, timer) {
    if (game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      var options = {picks: []};
      var item, player, answers;
      for (item in game.currPlayers) if(game.currPlayers.hasOwnProperty(item)) {
        player = game.currPlayers[item];
        answers = game.actionsQueue[player.getID()];

        if(answers) {
          //if (!checkInput('game_cards', player.getSocket(), game.userList, answers[0])) {
          //  game.stop();
          //  return new GameError(socket, "GAMECARDS", "Неверные агрументы");
          //}

          options.picks.push({id: player.getID(), pick: answers[0].pick});
        }

      }
      options.gold = randomInteger(0, constants.CARD_COUNT - 1);

      game.emit(socket, options);

      game.nextGame = 'start';
      game.currPlayers = {};
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, 1);
      game.actionsQueue = {};
      game.countActions = constants.PLAYERS_COUNT;
      game.currTimer = startTimer(game.pSocket, game.handlers[game.nextGame]);
    }
  }
};

// Получить случайное число из диапазона
function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}