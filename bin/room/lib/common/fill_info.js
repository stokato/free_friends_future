/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Заополнить сведения о пользователе 
 */

var IOF = require('./../../../constants').PFIELDS;

module.exports = function (profile) {

  var info = {};
  info[IOF.ID]        = profile.getID();
  info[IOF.VID]       = profile.getVID();
  info[IOF.AGE]       = profile.getAge();
  info[IOF.SEX]       = profile.getSex();
  info[IOF.CITY]      = profile.getCity();
  info[IOF.COUNTRY]   = profile.getCountry();
  info[IOF.POINTS]    = profile.getPoints();
  info[IOF.ISFRIEND]  = false;
  info[IOF.INDEX]     = profile.getGameIndex();
  
  var gift = profile.getGift1();
  
  if(gift) {
    var result = {};
    result[IOF.FID]       = profile.getID();
    result[IOF.FVID]      = profile.getVID();
    result[IOF.ID]        = profile.getID();
    result[IOF.VID]       = profile.getVID();
    result[IOF.GIFTID]    = gift.giftid;
    result[IOF.SRC]       = gift.src;
    result[IOF.TYPE]      = gift.type;
    result[IOF.TITLE]     = gift.title;
    result[IOF.DATE]      = gift.date;
    result[IOF.UGIFTID]   = gift.gid;
    
    info[IOF.GIFT1]       = result;
  } else {
    info[IOF.GIFT1]       = null;
  }
  
  return info;
};