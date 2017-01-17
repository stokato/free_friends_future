/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Заополнить сведения о пользователе 
 */

const Config = require('./../../../../config.json');
const constants = require('./../../../constants');

const IOF = constants.PFIELDS;
const GIFT_TYPES = Config.gifts.types;

module.exports = function (profile) {

  let info = {};
  info[IOF.ID]        = profile.getID();
  info[IOF.VID]       = profile.getVID();
  info[IOF.AGE]       = profile.getAge();
  info[IOF.SEX]       = profile.getSex();
  info[IOF.CITY]      = profile.getCity();
  info[IOF.COUNTRY]   = profile.getCountry();
  info[IOF.POINTS]    = profile.getPoints();
  info[IOF.ISFRIEND]  = false;
  info[IOF.INDEX]     = profile.getGameIndex();
  info[IOF.LEVEL]     = profile.getLevel();
  
  info[IOF.GIFTS]     = {};
  
  for(let item in GIFT_TYPES) if(GIFT_TYPES.hasOwnProperty(item)) {
  
    let gift = profile.getGiftByType(GIFT_TYPES[item]);
    
    if(gift) {
      info[IOF.GIFTS][GIFT_TYPES[item]] = {
        [IOF.FID]     : profile.getID(),
        [IOF.FVID]    : profile.getVID(),
        [IOF.ID]      : profile.getID(),
        [IOF.VID]     : profile.getVID(),
        [IOF.GIFTID]  : gift[IOF.GIFTID],
        [IOF.SRC]     : gift[IOF.SRC],
        [IOF.TYPE]    : gift[IOF.TYPE],
        [IOF.TITLE]   : gift[IOF.TITLE],
        [IOF.DATE]    : gift[IOF.DATE],
        [IOF.UGIFTID] : gift[IOF.UGIFTID],
        [IOF.PARAMS]  : gift[IOF.PARAMS]
      };
    } else {
      info[IOF.GIFTS][GIFT_TYPES[item]]  = null;
    }
  }
  
  return info;
};