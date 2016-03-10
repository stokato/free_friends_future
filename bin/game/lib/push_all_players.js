// Ожидать хода ото всех играков (поместить их в список текущих игроков)
module.exports = function (room, players, withoutid) {
  var guys = room.guys;
  var girls = room.girls;
  
  for (guy in guys) {
    players.push(guys[guy]);
  }
  
  for (girl in girls) {
    players.push(girls[girl]);
  }
  
  for(var i = 0; i < withoutid.length; i++) {
    var index = players.indexOf(withoutid[i]);
    if (index != -1) players.splice(index, 1);
  }
}