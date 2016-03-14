// Остановить игру и сбросить флаги готовности к игре у всех игроков
module.exports = function() {
  clearTimeout(this.currTimer);
  
  var guys = this.gRoom.guys;
  var girls = this.gRoom.girls;
  
  var guy, girl;
  for (guy in guys) if(guys.hasOwnProperty(guy)) {
    guys[guy].setReady(false);
  }
  for (girl in girls) if(girls.hasOwnProperty(girl)) {
    girls[girl].setReady(false);
  }
};