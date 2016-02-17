/*
 Добавляем подарок в БД
 */
module.exports = function(options, callback) {
 var self = this;
 self.dbManager.addGift(self.pID, options, function(err) {
   if (err) { return callback(err, null); }

   self.pNewGifts ++;
   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, options);
   });
 });
};