module.exports = function(id, callback) {
  this.dbManager.deletePurchase(id, function(err, id) { // и самого пользователя
    if(err) { return callback(err, null) }

    callback(null, id);
  });
};