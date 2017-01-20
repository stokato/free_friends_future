/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * Поучаем сведения о темнице
 */

const PF  = require('../../const_fields');
  
module.exports = function (resultObj = {}) {
  if(this._prisoner !== null) {
    
    resultObj[PF.PRISON] = {
      [PF.ID]  : this._prisoner.id,
      [PF.VID] : this._prisoner.vid,
      [PF.SEX] : this._prisoner.sex
    };
    
  } else {
    resultObj[PF.PRISON] = null;
  }
  
  return resultObj;
};