/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const constants = require('../../../../constants');

const startBest        = require('../starters/s_best');
const startBottle      = require('../starters/s_bottle');
const startCards       = require('../starters/s_cards');
const startPrison      = require('../starters/s_prison');
const startQuestions   = require('../starters/s_questions');
const startSympathy    = require('../starters/s_sympathy');

module.exports = function(timer, game) {
  // Сбрасываем таймер
  clearTimeout(game._timer);
  
  // Если игроков недостаточно - останавливаем игру
  if(!game.checkCountPlayers()) {
    return game.stop();
  }
  
  game._currCountInRoom = game._room.getCountInRoom(constants.GIRL) +
                          game._room.getCountInRoom(constants.GUY);

  // Определяем следующую игру, если игроков слишком мало - то без тюрьмы
  let rand, games;
  
  if(game._prisoner !== null ||
      game._room.getCountInRoom(constants.GIRL) <= 2 ||
      game._room.getCountInRoom(constants.GUY) <= 2) {
    
    games = constants.GAMES_WITHOUT_PRISON;
  } else {
    games = constants.GAMES;
  }
  
  do {
    rand = Math.floor(Math.random() * games.length);
  } while(rand == game._storedRand);
  
  game._storedRand = rand;
  
  switch (games[rand]) {
    case constants.G_BOTTLE     : game._handlers.starters.startBottle(game);    break;
    case constants.G_QUESTIONS  : game._handlers.starters.startQuestions(game);  break;
    case constants.G_CARDS      : game._handlers.starters.startCards(game);     break;
    case constants.G_BEST       : game._handlers.starters.startBest(game);      break;
    case constants.G_SYMPATHY   : game._handlers.starters.startSympathy(game);  break;
    case constants.G_PRISON     : game._handlers.starters.startPrison(game);    break;
  }
};
