/**
 * Убираем из профиля сведения о последнем подарке
 *
 * @param callback
 */
module.exports = function(callback) {
  this._pGift1 = null;
  this._pGift1Time = null;

  this.save(function(err) {
    if (err) { return callback(err, null); }

    callback(null, null);
  });
};