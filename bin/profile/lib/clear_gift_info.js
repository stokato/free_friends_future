
module.exports = function(callback) {
  this.pGift1 = null;
  this.pGift1Time = null;

  this.save(function(err) {
    if (err) { return callback(err, null); }

    callback(null, null);
  });
};