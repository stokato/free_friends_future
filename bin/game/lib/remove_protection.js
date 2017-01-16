/**
 * Created by s.t.o.k.a.t.o on 16.01.2017.
 */

module.exports = function () {
  
  for(let item in this._prisonProtection) if(this._prisonProtection.hasOwnProperty(item)) {
    this._prisonProtection[item].rounds --;
    
    if(this._prisonProtection[item].rounds < 1) {
      delete this._prisonProtection[item];
    }
  }
  
};