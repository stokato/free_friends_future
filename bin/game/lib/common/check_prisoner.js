/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const PF  = require('../../../constants').PFIELDS;
  
module.exports = function (game, result = {}) {
  if(game._prisoner !== null) {
    
    result[PF.PRISON] = {
      [PF.ID]  : game._prisoner.id,
      [PF.VID] : game._prisoner.vid,
      [PF.SEX] : game._prisoner.sex
    };
    
  } else {
    result[PF.PRISON] = null;
  }
  
  return result;
};