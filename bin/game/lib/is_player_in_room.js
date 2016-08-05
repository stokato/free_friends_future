// Проверяем - есть ли в комнате игрок с таким uid
module.exports = function(room, uid) {

  var item, guy, girl;
  var guys = room.guys;
  var girls = room.girls;

  for (item in guys) if(guys.hasOwnProperty(item)) {
    guy = guys[item];
    if (guy.getID() == uid) { return true; }
  }
  for (item in girls) if(girls.hasOwnProperty(item)) {
    girl = girls[item];
    if (girl.getID() == uid) { return true; }
  }

 return false;
};