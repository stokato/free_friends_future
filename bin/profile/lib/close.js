/**
 * Created by s.t.o.k.a.t.o on 17.01.2017.
 */

module.exports = function()  {
  
  this._pSocket = null;
  
  clearTimeout(this._pInactionTimer);
  
  for(let item in this._pGifts) if (this._pGifts.hasOwnProperty(item)) {
    clearTimeout(this._pGifts[item].timeout);
  }
};