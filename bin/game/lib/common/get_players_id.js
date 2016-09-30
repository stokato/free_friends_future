// Собрать в массив информацию всех играков в списке
module.exports = function () {
  var arr = [], item, player;
  for(item in this.gActivePlayers) if(this.gActivePlayers.hasOwnProperty(item)) {
    player = this.gActivePlayers[item];

    var playerInfo = {
      id    : player.id,
      vid   : player.vid,
      sex   : player.sex,
      index : player.index
    };

    arr.push(playerInfo);
  }
  return arr;
};