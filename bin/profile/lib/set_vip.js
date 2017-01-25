/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Меняем статус VIP
 */

const  dbCtrlr = require('./../../db_controller');
const  PF      = require('./../../const_fields');

module.exports = function(vip, callback) {
  let  self = this;
  
  let  isVIP = !!vip;
  
  let  options = {
    [PF.ID]  : self._pID,
    [PF.VID] : self._pVID,
    [PF.VIP] : isVIP
  };
  
  dbCtrlr.updateUser(options, (err) => {
    if (err) {
      return callback(err, null);
    }
  
    self._pVIP = isVIP;
    
    callback(null, self._pVIP);
  });
};