/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Меняем статус VIP
 */

const  db = require('./../../db_manager');
const  IOF = require('./../../constants').PFIELDS;

module.exports = function(vip, callback) {
  let  self = this;
  
  let  isVIP = !!vip;
  
  let  options = {
    [IOF.ID]  : self._pID,
    [IOF.VID] : self._pVID,
    [IOF.VIP] : isVIP
  };
  
  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }
  
    self._pVIP = isVIP;
    
    callback(null, self._pVIP);
  });
};