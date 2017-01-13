/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const PF  = require('../../constants').PFIELDS;
  
module.exports = function (result = {}) {
  if(this._prisoner !== null) {
    
    result[PF.PRISON] = {
      [PF.ID]  : this._prisoner.id,
      [PF.VID] : this._prisoner.vid,
      [PF.SEX] : this._prisoner.sex
    };
    
  } else {
    result[PF.PRISON] = null;
  }
  
  return result;
};