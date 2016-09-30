// Ожидать хода ото всех играков (поместить их в список текущих игроков)
module.exports = function (excessIds) {  excessIds = excessIds || [];

  var guys = this.gRoom.guys;
  var girls = this.gRoom.girls;
  var prisonerId = (this.gPrisoner)? this.gPrisoner.id : null;

  var guy, girl, item;
  for (item in guys) if (guys.hasOwnProperty(item)) {
    guy = guys[item];
    if(excessIds.indexOf(guy.getID()) < 0 && prisonerId != guy.getID()) {
      this.gActivePlayers[guy.getID()] = this.getPlayerInfo(guy);
    }
  }
  
  for (item in girls) if(girls.hasOwnProperty(item)) {
    girl = girls[item];
    if(excessIds.indexOf(girl.getID()) < 0 && prisonerId != girl.getID()) {
      this.gActivePlayers[girl.getID()] = this.getPlayerInfo(girl);
    }
  }
};