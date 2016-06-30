
var getPlayerInfo  = require('../lib/get_player_info');

// Ожидать хода ото всех играков (поместить их в список текущих игроков)
module.exports = function (room, players, excessIds, prisoners) {
  excessIds = excessIds || [];
  var guys = room.guys;
  var girls = room.girls;

  var guy, girl, item;
  for (item in guys) if (guys.hasOwnProperty(item)) {
    guy = guys[item];
    if(excessIds.indexOf(guy.getID()) < 0 && !prisoners[guy.getID()]) {
      players[guy.getID()] = getPlayerInfo(guy);
    }
  }
  
  for (item in girls) if(girls.hasOwnProperty(item)) {
    girl = girls[item];
    if(excessIds.indexOf(girl.getID()) < 0 && !prisoners[girl.getID()]) {
      players[girl.getID()] = getPlayerInfo(girl);
    }
  }
};