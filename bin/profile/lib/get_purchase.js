var db = require('./../../db_manager');

/*
 Проверяем, покупал ли пользователь такой товар
 */
module.exports = function(goodid, callback) {
  var self = this;
  db.findPurchase(self.pID, function(err, foundGoods) {
    if (err) { return cb(err); }
    if (foundGoods) {
      var good = null, i;
      for(i = 0; i < foundGoods.length; i++) {
        if(foundGoods[i].goodid == goodid) {
          good = foundGoods[i];
          break;
        }
      }
      callback(null, good);
    } else {
      callback(null, null);
    }
  });
};