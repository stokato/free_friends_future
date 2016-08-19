var GameError = require('../../game_error'),
  checkInput = require('../../check_input'),
  constants = require('./../../constants');

var oPool = require('./../../objects_pool');

/*
 Показать текущий баланс
 */
module.exports = function (socket) {
  socket.on(constants.IO_GET_MONEY, function(options) {
    if (!checkInput(constants.IO_GET_MONEY, socket, oPool.userList, options)) { return; }

    oPool.userList[socket.id].getMoney(function (err, money) {
      if (err) {  return handError(err); }

      socket.emit(constants.IO_GET_MONEY, {
        money : money,
        operation_status : constants.RS_GOODSTATUS
      });
    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GET_MONEY, res);

      new GameError(socket, constants.IO_GET_MONEY, err.message || constants.errors.OTHER.message);
    }
  });
};


