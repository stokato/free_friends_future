var db = require('./../../../db_manager');

/*
 Добавляем подарок в БД
 */
module.exports = function(giftMaker, date, gift, callback) {
  var self = this;
  
  var options = {
    fromid      : giftMaker.getID(),
    fromvid     : giftMaker.getVID(),
    date        : date,
    src         : gift.src,
    giftid      : gift.id,
    type        : gift.type,
    title       : gift.title
  };

  db.addGift(self.pID, options, function(err, result) {
    if (err) { return callback(err, null); }

    self.pGift1 = result;
    self.pGift1Time = new Date();

    self.pNewGifts ++;
    self.save(function(err) {
      if (err) { return callback(err, null); }

      callback(null, options);
    });
  });

};

