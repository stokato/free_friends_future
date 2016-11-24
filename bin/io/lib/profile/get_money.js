var constants = require('./../../../constants');
var oPool     = require('./../../../objects_pool');

/*
 Показать текущий баланс
 */
module.exports = function (socket, options, callback) {

    oPool.userList[socket.id].getMoney(function (err, money) {
      if (err) {  return callback(err); }
      
      var res = {};
      res[constants.PFIELDS.money] = money;
      
      callback(null, res);
    });
  
};


