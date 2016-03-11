// Выбрать произвольного игрока любого, или указанного пола
module.exports = function (room, sex) {
  var guys = room.guys;
  var girls = room.girls;
  var allPlayers = [];
  var gender = sex || '';

  var guy, girl;

  if(gender == '' || gender == 'guy')    {
    for (guy in guys)  if (guys.hasOwnProperty(guy)) {
      allPlayers.push(guys[guy]);
    }
  }
  
  if(gender == '' || gender == 'girl') {
    for (girl in girls) if(girls.hasOwnProperty(girl)) {
      allPlayers.push(girls[girl]);
    }
  }
  
  var rand = randomInteger(0, allPlayers.length-1);
  return allPlayers[rand];
};

// Получить случайное число из диапазона
function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}