// Собрать в массив информацию всех играков в списке
module.exports = function () {
  let arr = [], item, player;
  for(item in this._activePlayers) if(this._activePlayers.hasOwnProperty(item)) {
    player = this._activePlayers[item];

    arr.push({
      id    : player.id,
      vid   : player.vid,
      sex   : player.sex,
      index : player.index
    });
  }
  return arr;
};