var db = require('./../../../db_manager');

/*
 Добавляем подарок в БД
 */
module.exports = function(giftMaker, date, gift, callback) {
  var self = this;
  
  var options = {};
  options[db.CONST.ID]  = giftMaker.getID();
  options[db.CONST.VID] = giftMaker.getVID();
  options[db.CONST.DATE]    = date;
  options[db.CONST.SRC]     = gift.src;
  options[db.CONST.GIFTID]  = gift.id;
  options[db.CONST.TYPE]    = gift.type;
  options[db.CONST.TITLE]   = gift.title;

  db.addGift(self._pID, options, function(err, result) {
    if (err) { return callback(err, null); }

    self._pGift1 = result;
    self._pGift1Time = date;

    // self._pIsNewGifts ++;
    self.save(function(err) {
      if (err) { return callback(err, null); }

      callback(null, options);
    });
  });

};