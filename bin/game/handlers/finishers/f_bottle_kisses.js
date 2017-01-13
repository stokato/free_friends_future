/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */
const logger = require('./../../../../lib/log')(module);

const Config    = require('./../../../../config.json');
const constants = require('./../../../constants');
const stat      = require('./../../../stat_manager');

const addPoints = require('./../../lib/add_points');

const PF          = constants.PFIELDS;
const KISS_POINTS = Number(Config.points.game.mutual_kiss);

module.exports = function (game) {
  
  game.clearTimer();
  
  stat.setMainStat(constants.SFIELDS.BOTTLE_ACTIVITY, game.getActivityRating());
  
  let allKissed = true;
  let players = game.getActivePlayers();
  for(let i = 0; i < players.length(); i++) {
    let actions = game.getAction(players[i].id);
    if(!actions || actions[0][PF.PICK] == false) {
      allKissed = false;
    }
  }
  
  // Если оба поцеловали друг друга, добавляем им очки
  if(allKissed) {
    for(let i = 0; i < players.length; i++) {
      addPoints(players[i].id, KISS_POINTS, onComplete(i))
    }
  }
  
  //-----------------------------
  function onComplete(count) {
    return function(err) {
      if(err) {
        logger.error(constants.G_BOTTLE_KISSES + ' ' + constants.GT_FIN);
        logger.error(err);
      }
  
      count++;
      if(count < players.length) {
        addPoints(players[count].id, KISS_POINTS, onComplete(count));
      } else {
        game.getHandler(constants.G_START, constants.GT_ST)(game, null, true);
      }
    }
  }
  
};