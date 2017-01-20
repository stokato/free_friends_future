/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Заополнить сведения о пользователе 
 */

const Config = require('./../../../../config.json');
const PF     = require('./../../../const_fields');

module.exports = function (profile) {
  
  const GIFT_TYPES  = Config.gifts.types;

  let infoObj = {
    [PF.ID]        : profile.getID(),
    [PF.VID]       : profile.getVID(),
    [PF.AGE]       : profile.getAge(),
    [PF.SEX]       : profile.getSex(),
    [PF.CITY]      : profile.getCity(),
    [PF.COUNTRY]   : profile.getCountry(),
    [PF.POINTS]    : profile.getPoints(),
    [PF.ISFRIEND]  : false,
    [PF.INDEX]     : profile.getGameIndex(),
    [PF.LEVEL]     : profile.getLevel(),
    [PF.GIFTS]     : {}
  };

  
  for(let item in GIFT_TYPES) if(GIFT_TYPES.hasOwnProperty(item)) {
  
    let giftObj = profile.getGiftByType(GIFT_TYPES[item]);
    
    if(giftObj) {
      infoObj[PF.GIFTS][GIFT_TYPES[item]] = {
        [PF.FID]     : profile.getID(),
        [PF.FVID]    : profile.getVID(),
        [PF.ID]      : profile.getID(),
        [PF.VID]     : profile.getVID(),
        [PF.GIFTID]  : giftObj[PF.GIFTID],
        [PF.SRC]     : giftObj[PF.SRC],
        [PF.TYPE]    : giftObj[PF.TYPE],
        [PF.TITLE]   : giftObj[PF.TITLE],
        [PF.DATE]    : giftObj[PF.DATE],
        [PF.UGIFTID] : giftObj[PF.UGIFTID],
        [PF.PARAMS]  : giftObj[PF.PARAMS]
      };
    } else {
      infoObj[PF.GIFTS][GIFT_TYPES[item]]  = null;
    }
  }
  
  return infoObj;
};