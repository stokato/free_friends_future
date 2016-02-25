
module.exports = function(goodid, callback) {
  this.dbManager.findGood(goodid, function (err, goodInfo) {
    if (err) { return callback(err, null) }
    
    if (goodInfo) {
      callback(null, goodInfo);
    } else callback(new Error("Нет такого подарка"), null);
  });
};