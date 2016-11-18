var db = require('./../../../db_manager');

/*
    Получить историю приватного чата за заданный период времени
 */
module.exports = function(options, callback) {
  var self = this;
  
  var params = {};
  params[db.CONST.ID_LIST]    = [options.id];
  params[db.CONST.DATE_FROM]  = options.first_date;
  params[db.CONST.DATE_TO]    = options.second_date;

  db.findMessages(self._pID, params, function(err, messages) { messages = messages || [];
    if (err) { return callback(err, null); }
  
    messages.sort(function (mesA, mesB) {
      return mesA.date - mesB.date;
    });
    
    callback(null, messages);
  });
};
