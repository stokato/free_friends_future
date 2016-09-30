var oPool = require('./../../../objects_pool');

/*
 Показать текущий баланс
 */
module.exports = function (socket, options, callback) {

    oPool.userList[socket.id].getMoney(function (err, money) {
      if (err) {  return callback(err); }
      
      callback(null, { money : money });
    });
  
};


