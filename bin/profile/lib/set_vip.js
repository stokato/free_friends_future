/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Меняем статус VIP
 */

var db = require('./../../db_manager');
var IOF = require('./../../constants').PFIELDS;

module.exports = function(vip, callback) {
  var self = this;
  
  var isVIP = !!vip;
  
  var options = {};
  options[IOF.ID]     = self._pID;
  options[IOF.VID]    = self._pVID;
  options[IOF.VIP]    = isVIP;
  
  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }
  
    self._pVIP = isVIP;
    
    callback(null, self._pVIP);
  });
};