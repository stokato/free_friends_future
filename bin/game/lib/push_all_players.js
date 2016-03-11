
// Ожидать хода ото всех играков (поместить их в список текущих игроков)
module.exports = function (room, players, excessIds) {
  excessIds = excessIds || [];
  var guys = room.guys;
  var girls = room.girls;

  var guy, girl, item;
  for (item in guys) if (guys.hasOwnProperty(item)) {
    guy = guys[item];
    if(excessIds.indexOf(guy.getID()) < 0) {
      players[guys[guy].getID()] = (guys[guy]);
    }
  }
  
  for (item in girls) if(girls.hasOwnProperty(item)) {
    girl = girls[item];
    if(excessIds.indexOf(girl.getID()) < 0) {
      players[girls[girl].getID()] = (girls[girl]);
    }
  }
};