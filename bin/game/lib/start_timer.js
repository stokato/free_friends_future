var constants = require('../constants_game');
// Запустить таймер, по истечении которого будет выполнен заданный обработчик игры
module.exports = function(socket, func) {
  return setTimeout(function() {
    func(socket, true, null, null);
  }, constants.TIMEOUT * 1000);
};