/**
 * Добавляем подарок в БД
 *
 * При этом обновляем сведения о подарке, весящем на аве и сохраняем это так же в БД
 */

const Config    = require('./../../../config.json');
const db        = require('./../../db_manager');
const constants = require('./../../constants');

const IOF           = constants.PFIELDS;
const GIFT_TIMEOUTS  = Config.gifts.timeouts;

module.exports = function(giftMaker, date, gift, params, callback) {
  let  self = this;
 
  let  options = {
    [IOF.ID]      : giftMaker.getID(),
    [IOF.VID]     : giftMaker.getVID(),
    [IOF.SEX]     : giftMaker.getSex(),
    [IOF.BDATE]   : giftMaker.getBDate(),
    [IOF.DATE]    : date,
    [IOF.SRC]     : gift[IOF.SRC],
    [IOF.GIFTID]  : gift[IOF.ID],
    [IOF.TYPE]    : gift[IOF.TYPE],
    [IOF.TITLE]   : gift[IOF.TITLE],
    [IOF.GROUP]   : gift[IOF.GROUP]
  };

  db.addGift(self._pID, options, (err, result) => {
    if (err) { return callback(err, null); }
    
    let type = gift[IOF.TYPE];
    
    if(!self._pGifts[type]) {
      self._pGifts[type] = {};
    }
    
    self._pGifts[type].gift = result;
    self._pGifts[type].gift[IOF.PARAMS] = params;
    
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