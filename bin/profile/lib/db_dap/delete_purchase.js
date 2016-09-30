var db = require('./../../../db_manager');

module.exports = function(id, callback) {
  db.deletePurchase(id, function(err, id) { // и самого пользователя
    if(err) { return callback(err, null) }

    callback(null, id);
  });
};