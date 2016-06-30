var constants = require('../constants');

// Выбрать произвольного игрока любого, или указанного пола
module.exports = function (room, sex, excessIds, prisoners) {
  excessIds = excessIds || [];

  var guys = room.guys;
  var girls = room.girls;
  var allPlayers = [], item;

  if(!sex || sex == constants.CONFIG.sex.male)    {
    for (item in guys)  if (guys.hasOwnProperty(item)) {
      allPlayers.push(guys[item]);
    }
  }
  
  if(!sex || sex == constants.CONFIG.sex.female) {
    for (item in girls) if(girls.hasOwnProperty(item)) {
      allPlayers.push(girls[item]);
    }
  }

  if(excessIds.length == allPlayers.length) { return null; }

  if(allPlayers.length == 0) { return null; }

  var rand = Math.floor(Math.random() * allPlayers.length);
  while(excessIds.indexOf(allPlayers[rand].getID()) > -1 || prisoners[allPlayers[rand].getID()]) {
    rand = Math.floor(Math.random() * allPlayers.length);
  }

  return allPlayers[rand];
};
