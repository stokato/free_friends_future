/*
    Ожидать хода ото всех играков, кроме указанных (поместить их в список текущих игроков)
  */
module.exports = function (excessIds) {  excessIds = excessIds || [];
  
  let prisonerId = (this._prisoner)? this._prisoner.id : null;

  let playersArr = this._room.getAllPlayers();
  
  let currId;
  
  let playersCount = playersArr.length;
  for(let i = 0; i < playersCount; i++) {
    currId = playersArr[i].getID();
    
    if(excessIds.indexOf(currId) < 0 && currId != prisonerId) {
      this._activePlayers[currId] = this.getPlayerInfo(playersArr[i]);
    }
  }
};