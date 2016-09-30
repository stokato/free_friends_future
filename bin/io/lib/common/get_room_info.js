/*
 Подготовить данные по комнате
 - По каждому игроку в комнате
 -- Берем данные его прифиля и добавлям в объект
 - Возвращаем объект и комнату обратно
 */
module.exports = function (room, callback) {
  var info = { name : room.name, guys : [], girls : [] , track_list : room.track_list };

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
  //var f = constants.FIELDS;
  var info = {};
  info.id      = profile.getID();
  info.vid     = profile.getVID();
  info.age     = profile.getAge();
  info.sex     = profile.getSex();
  info.city    = profile.getCity();
  info.country = profile.getCountry();
  info.points  = profile.getPoints();
  info.is_friend = false;
  info.index  = profile.getGameIndex();

  var gift = profile.getGift1();

  if(gift) {

    var result = {};
    result.fromid  = profile.getID();
    result.fromvid = profile.getVID();
    result.id      = profile.getID();
    result.vid     = profile.getVID();
    result.giftid  = gift.giftid;
    result.src     = gift.src;
    result.type    = gift.type;
    result.title   = gift.title;
    result.date    = gift.date;
    result.gid     = gift.gid;

    info.gift1 = result;
  } else {
    info.gift1 = null;
  }


  return info;
}
