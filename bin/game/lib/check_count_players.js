var constants_io = require('../../io/constants');
var constants = require('../constants');

module.exports = function(game) {

  var guysInPrison = 0;
  var girlsInPrison = 0;

  if(game.gPrisoner !== null) {
    var sex = game.gPrisoner.sex;


    if(sex == constants_io.GUY) {
      guysInPrison = 1;
    } else {
      girlsInPrison = 1;
    }
  }

  var guysCount = game.gRoom.guys_count - guysInPrison;
  var girlsCount = game.gRoom.girls_count - girlsInPrison;

  if((guysCount) < constants.PLAYERS_COUNT || (girlsCount) < constants.PLAYERS_COUNT) {
    console.log("guys " + guysCount);
    console.log("girls " + girlsCount);
    return false;
  }

  return true;
};