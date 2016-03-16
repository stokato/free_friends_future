var constants = require('./../constants');
/*
 Подготовить данные по комнате
 - По каждому игроку в комнате
 -- Берем данные его прифиля и добавлям в объект
 - Возвращаем объект и комнату обратно
 */
module.exports = function (room, callback) {
  var info = { name : room.name, guys : [], girls : [] };

  var gInfo = null;
  var item;
  for (item in room.guys) if (room.guys.hasOwnProperty(item)){
    gInfo = fillInfo(room.guys[item]);
    info.guys.push(gInfo);
  }
  for (item in room.girls) if (room.girls.hasOwnProperty(item)) {
    gInfo = fillInfo(room.girls[item]);
    info.girls.push(gInfo);
  }
  callback(null, info, room);
};

function fillInfo(profile) {
  var f = constants.FIELDS;
  var info = {};
  info[f.id]      = profile.getID();
  info[f.vid]     = profile.getVID();
  info[f.age]     = profile.getAge();
  info[f.sex]     = profile.getSex();
  info[f.city]    = profile.getCity();
  info[f.country] = profile.getCountry();
  info[f.points]  = profile.getPoints();

  return info;
}
