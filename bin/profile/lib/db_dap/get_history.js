var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
    Получить историю приватного чата за заданный период времени
 */
module.exports = function(id, fdate, sdate, callback) {
  var self = this;
  
  var params = {};
  params[IOF.ID_LIST]    = [id];
  params[IOF.DATE_FROM]  = fdate;
  params[IOF.DATE_TO]    = sdate;

  db.findMessages(self._pID, params, function(err, messages) { messages = messages || [];
    if (err) { return callback(err, null); }
  
    messages.sort(function (mesA, mesB) {
      return mesA[IOF.DATE] - mesB[IOF.DATE];
    });
    
    callback(null, messages);
  });
};
