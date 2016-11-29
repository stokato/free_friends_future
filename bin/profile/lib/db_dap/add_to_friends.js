var db  = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
    Добавляем друга в БД
 */
module.exports = function(friendProfile, date, callback) {
 var self = this;
  
  var params = {};
  params[IOF.ID]     = friendProfile.getID();
  params[IOF.VID]    = friendProfile.getVID();
  params[IOF.SEX]    = friendProfile.getSex();
  params[IOF.BDATE]  = friendProfile.getBDate();
  params[IOF.DATE]   = date;
  
 db.addFriend(self._pID, params, function (err) {
   if (err) { return callback(err, null); }

     callback(null, friendProfile.getID());
 });
};