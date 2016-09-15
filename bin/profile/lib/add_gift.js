var db = require('./../../db_manager');

var constants = require('./../../constants');

/*
 Добавляем подарок в БД
 */
module.exports = function(options, callback) {
  var self = this;

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

