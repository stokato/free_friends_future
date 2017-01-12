/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config    = require('../../../../../config.json');
const constants = require('../../../../constants');
const GameError = require('../../common/game_error');
const stat      = require('../../../../stat_manager');

const addPoints = require('../../common/add_points');

const PF          = constants.PFIELDS;
const KISS_POINTS = Number(Config.points.game.mutual_kiss);

module.exports = function (timer, socket, game) {
  
  clearTimeout(game._timer);
  
  let count = 0, players = [];
  
  let allKissed = true;
  for(let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
    let pInf  = game._activePlayers[item];
    if(!game._actionsQueue[pInf.id] || !game._actionsQueue[pInf.id][0][PF.PICK] === true) {
      allKissed = false;
    }
  }
  
  // Если оба поцеловали друг друга, нужно добавить им очки, получаем данные игроков
  if(allKissed) {
    for(let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
      players.push(game._activePlayers[item]);
    } // и начесляем очки
    addPoints(players[count].id, KISS_POINTS, onComplete);
  }
  
  stat.setMainStat(constants.SFIELDS.BOTTLE_ACTIVITY, game.getActivityRating());
  
  game.restoreGame(null, true);
  
  //----------------
  function onComplete(err) {
    if(err) { return new GameError(constants.G_BOTTLE_KISSES, err.message); }
    
    count++;
    if(count < players.length) {
      addPoints(players[count].id, KISS_POINTS, onComplete);
    }
  }
  
};