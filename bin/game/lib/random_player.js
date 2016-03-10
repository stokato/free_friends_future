// Выбрать произвольного игрока любого, или указанного пола
module.exports = function (room, gen) {
  var guys = room.guys;
  var girls = room.girls;
  var allPlayers = [];
  var gender = gen || '';
  
  if(gender == '' || gender == 'guy')   {
    for (guy in guys) {
      allPlayers.push(guys[guy]);
    }
  }
  
  if(gender == '' || gender == 'girl') {
    for (girl in girls) {
      allPlayers.push(girls[girl]);
    }
  }
  
  var rand = randomInteger(0, allPlayers.length-1);
  return allPlayers[rand];
};