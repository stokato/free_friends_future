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
      age: room.guys[guy].getAge(),
      sex: room.guys[guy].getSex(),
      city: room.guys[guy].getCity(),
      country: room.guys[guy].getCountry(),
      points: room.guys[guy].getPoints()
    };
    info.guys.push(gInfo);
  }
  var girl;
  for (girl in room.girls) if (room.girls.hasOwnProperty(girl)) {
    gInfo = {
      id: room.girls[girl].getID(),
      vid: room.girls[girl].getVID(),
      age: room.girls[girl].getAge(),
      sex: room.girls[girl].getSex(),
      city: room.girls[girl].getCity(),
      country: room.girls[girl].getCountry(),
      points: room.girls[girl].getPoints()
    };
    info.girls.push(gInfo);
  }
  callback(null, info, room);
};


