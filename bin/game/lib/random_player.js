// Выбрать произвольного игрока любого, или указанного пола
module.exports = function (room, sex, excessIds) {
  var guys = room.guys;
  var girls = room.girls;
  var allPlayers = [];
  var gender = sex || '';
  excessIds = excessIds || [];

  var guy, girl;

  if(gender == '' || gender == 2)    {
    for (guy in guys)  if (guys.hasOwnProperty(guy)) {
      allPlayers.push(guys[guy]);
    }
  }
  
  if(gender == '' || gender == 1) {
    for (girl in girls) if(girls.hasOwnProperty(girl)) {
      allPlayers.push(girls[girl]);
    }
  }

  if(excessIds.length == allPlayers.length) { return -1; }

  var rand = randomInteger(0, allPlayers.length-1);
  while(excessIds.indexOf(allPlayers[rand].getID()) > -1) {
    rand = randomInteger(0, allPlayers.length-1);
  }

  return allPlayers[rand];
};

// Получить случайное число из диапазона
function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}