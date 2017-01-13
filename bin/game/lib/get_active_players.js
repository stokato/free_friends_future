/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

module.exports = function () {
  let players = [];
  for(let item in this._activePlayers) if(this._activePlayers.hasOwnProperty(item)) {
    players.push(this._activePlayers[item]);
  }
  return players;
};