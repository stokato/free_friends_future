var db = require('./../../../db_manager');

/*
    Получаем из БД все подарки
 */
module.exports = function(isSelf, callback) {
 var self = this;
  
 db.findGifts(self._pID, isSelf, function(err, gifts) {
   if (err) { callback(err, null); }

   // self._pIsNewGifts = 0;
   
   // self.save(function(err) {
   //   if (err) { return callback(err, null); }
   //
      callback(null, gifts);
   // });
 });
};