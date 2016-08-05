// Собрать в массив ИД всех играков в списке
module.exports = function (players) {
  var arr = [], item, player;
  for(item in players) if(players.hasOwnProperty(item)) {
    player = players[item];

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