/**
 * Добавляем подарок в БД
 *
 * При этом обновляем сведения о подарке, весящем на аве и сохраняем это так же в БД
 */

const Config    = require('./../../../config.json');
const dbCtrlr   = require('./../../db_controller');
const PF        = require('./../../const_fields');

module.exports = function(giftMaker, date, gift, count, params, callback) {
  
  const GIFT_TIMEOUTS  = Config.gifts.timeouts;
  
  let  self = this;
 
  let  options = {
    [PF.ID]      : giftMaker.getID(),
    [PF.VID]     : giftMaker.getVID(),
    [PF.SEX]     : giftMaker.getSex(),
    [PF.BDATE]   : giftMaker.getBDate(),
    [PF.DATE]    : date,
    [PF.SRC]     : gift[PF.SRC],
    [PF.GIFTID]  : gift[PF.ID],
    [PF.TYPE]    : gift[PF.TYPE],
    [PF.TITLE]   : gift[PF.TITLE],
    [PF.GROUP]   : gift[PF.GROUP],
    [PF.COUNT]   : count || 1
  };

  dbCtrlr.addGift(self._pID, options, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    
    let type = gift[PF.TYPE];
    
    if(!self._pGifts[type]) {
      self._pGifts[type] = {};
    }
    
    self._pGifts[type].gift = result;
    self._pGifts[type].gift[PF.PARAMS] = params;
    
    let timeout = Number(GIFT_TIMEOUTS[type]);
    
    if(timeout > 0) {
      if(self._pGifts[type].timeout) {
        clearTimeout(self._pGifts[type].timeout);
      }
      
      self._pGifts[type].timeout = setTimeout(((gtype) => {
        return () => {
          self._pGifts[gtype].gift = null;
      
          if(self._onGiftTimeout) {
            self._onGiftTimeout(self, gtype);
          }
        };
    
      })(type), timeout);
    }
  
    callback(null, options);
  });
  
};