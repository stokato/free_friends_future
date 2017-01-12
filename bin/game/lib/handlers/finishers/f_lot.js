/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const constants = require('../../../../constants');

const onBest        = require('./../pickers/p_best');
const onBottle      = require('./../pickers/p_bottle');
const onCards       = require('./../pickers/p_cards');
const onPrison      = require('./../pickers/p_prison');
const onQuestion    = require('./../pickers/p_questions');
const onSympathy    = require('./../pickers/p_sympathy');

const  PF        = constants.PFIELDS;

module.exports = function(timer, socket, game) {
  // Сбрасываем таймер
  clearTimeout(game._timer);
  
  // Если игроков недостаточно - останавливаем игру
  if(!game.checkCountPlayers()) {
    return game.stop();
  }
  
  game._currCountInRoom = game._room.getCountInRoom(constants.GIRL) + game._room.getCountInRoom(constants.GUY);

  // Определяем следующую игру, если игроков слишком мало - то без тюрьмы
  let rand;
  let games = (game._prisoner !== null ||
  game._room.getCountInRoom(constants.GIRL) <= 2 ||
  game._room.getCountInRoom(constants.GUY) <= 2)?
    constants.GAMES_WITHOUT_PRISON : constants.GAMES;
  do {
    rand = Math.floor(Math.random() * games.length);
  } while(rand == game.gStoredRand);
  
  game._nextGame = games[rand];
  
  game._actionsQueue = {};
  
  let result = {
    [PF.NEXTGAME] : game._nextGame,
    [PF.PLAYERS] : []
  };
  
  switch (game._nextGame) {
    case constants.G_BOTTLE     : game._onGame = onBottle(game, result);    break;
    case constants.G_QUESTIONS  : game._onGame = onQuestion(game, result);  break;
    case constants.G_CARDS      : game._onGame = onCards(game, result);     break;
    case constants.G_BEST       : game._onGame = onBest(game, result);      break;
    case constants.G_SYMPATHY   : game._onGame = onSympathy(game, result);  break;
    case constants.G_PRISON     : game._onGame = onPrison(game, result);    break;
  }
};
