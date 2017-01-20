/**
 * Created by s.t.o.k.a.t.o on 20.01.2017.
 */

module.exports = function () {
  if(this._pBDate) {
    return new Date().getYear() - this._pBDate.getYear();
  }
  return null;
};