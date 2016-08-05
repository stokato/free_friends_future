var constants = require('../constants');

// Выбрать произвольного игрока любого, или указанного пола
module.exports = function (room, sex, excessIds, prisoner) { prisoner = prisoner || {};
  excessIds = excessIds || [];

  var guys = room.guys;
  var girls = room.girls;
  var allPlayers = [], item;

  if(!sex || sex == constants.CONFIG.sex.male)    {
    for (item in guys)  if (guys.hasOwnProperty(item)) {
      if(!isInExcess(guys[item].getID())) {
        allPlayers.push(guys[item]);
      }
    }
  }
  
  if(!sex || sex == constants.CONFIG.sex.female) {
    for (item in girls) if(girls.hasOwnProperty(item)) {
      if(!isInExcess(girls[item].getID())) {
        allPlayers.push(girls[item]);
      }
    }
  }

  if(allPlayers.length == 0) { return null; }

  var rand = Math.floor(Math.random() * allPlayers.length);

  return allPlayers[rand];

  //---------------------------------
  function isInExcess (id) {
    if(prisoner.id == id) {
      return true;
    }

    for(var i = 0; i < excessIds.length; i++) {
      if(excessIds[i] == id) {
        return true;
      }
    }

    return false;
  }
};
