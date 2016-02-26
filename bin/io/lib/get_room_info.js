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
    gInfo = fillInfo(room.guys[guy]);
    info.guys.push(gInfo);
  }
  var girl;
  for (girl in room.girls) if (room.girls.hasOwnProperty(girl)) {
    gInfo = fillInfo(room.girls[girl]);
    info.girls.push(gInfo);
  }
  callback(null, info, room);
};

function fillInfo(profile) {
  return {
    id: profile.getID(),
    vid: profile.getVID(),
    age: profile.getAge(),
    sex: profile.getSex(),
    city: profile.getCity(),
    country: profile.getCountry(),
    points: profile.getPoints()
  }
}
