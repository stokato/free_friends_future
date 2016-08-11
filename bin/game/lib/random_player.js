var constants = require('../../constants');

// Выбрать произвольного игрока любого, или указанного пола
module.exports = function (sex, excessIds) { excessIds = excessIds || [];
  var self = this;

  var guys = this.gRoom.guys;
  var girls = this.gRoom.girls;
  var allPlayers = [], item;

  if(!sex || sex == constants.GUY)    {
    for (item in guys)  if (guys.hasOwnProperty(item)) {
      if(!isInExcess(guys[item].getID())) {
        allPlayers.push(guys[item]);
      }
    }
  }
  
  if(!sex || sex == constants.GIRL) {
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
    if(self.gPrisoner && self.gPrisoner.id == id) {
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
