/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

module.exports = function (profile) {

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
};