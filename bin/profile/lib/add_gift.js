/**
 * Добавляем подарок в БД
 *
 * При этом обновляем сведения о подарке, весяцем на аве и сохраняем это так же в БД
 */

const Config    = require('./../../../config.json');
const db        = require('./../../db_manager');
const constants = require('./../../constants');

const IOF           = constants.PFIELDS;
const GIFT_TIMEOUT  = Number(Config.user.settings.gift_timeout);

module.exports = function(giftMaker, date, gsrc, gid, gtype, gtitle, callback) {
  let  self = this;
  
  let  options = {
    [IOF.ID]      : giftMaker.getID(),
    [IOF.VID]     : giftMaker.getVID(),
    [IOF.SEX]     : giftMaker.getSex(),
    [IOF.BDATE]   : giftMaker.getBDate(),
    [IOF.DATE]    : date,
    [IOF.SRC]     : gsrc,
    [IOF.GIFTID]  : gid,
    [IOF.TYPE]    : gtype,
    [IOF.TITLE]   : gtitle
  };

  db.addGift(self._pID, options, function(err, result) {
    if (err) { return callback(err, null); }

    self._pGift1     = result;
    self._pGift1Time = date;
    
    // self.save(function(err) {
    //   if (err) { return callback(err, null); }
    //
    //   callback(null, options);
    // });
    
    clearTimeout(self._pGift1Timeout);
  
    self._pGift1Timeout = setTimeout(function () {
      
      self._pGift1 = null;
      self._pGift1Time = null;
      
      if(self._onGiftTimeout) {
        self._onGiftTimeout(self);
      }
      
    }, GIFT_TIMEOUT);
  
    callback(null, options);
  });
  
};