/*
 Подготовить данные по комнате
 - По каждому игроку в комнате
 -- Берем данные его прифиля и добавлям в объект
 - Возвращаем объект и комнату обратно
 */
module.exports = function (room, callback) {
  var info = { name : room.name, guys : [], girls : [] };

  var gInfo = null;
  var guy;
  for (guy in room.guys) if (room.guys.hasOwnProperty(guy)){
    gInfo = {
      id: room.guys[guy].getID(),
      vid: room.guys[guy].getVID(),
      points: room.guys[guy].getPoints()
    };
    info.guys.push(gInfo);
  }
  var girl;
  for (girl in room.girls) if (room.girls.hasOwnProperty(girl)) {
    gInfo = {
      id: room.girls[girl].getID(),
      vid: room.girls[girl].getVID(),
      points: room.girls[girl].getPoints()
    };
    gInfo['points'] = room.girls[girl].getPoints();
    info.girls.push(gInfo);
  }
  callback(null, info, room);
};


