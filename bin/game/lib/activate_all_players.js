/*
    Ожидать хода ото всех играков, кроме указанных (поместить их в список текущих игроков)
  */
module.exports = function (excessIds) {  excessIds = excessIds || [];
  
  let prisonerId = (this._prisoner)? this._prisoner.id : null;

  let players = this._room.getAllPlayers();
  
  let currId;
  
  for(let i = 0; i < players.length; i++) {
    currId = players[i].getID();
    
    if(excessIds.indexOf(currId) < 0 && currId != prisonerId) {
      this._activePlayers[currId] = this.getPlayerInfo(players[i]);
    }
  }
};