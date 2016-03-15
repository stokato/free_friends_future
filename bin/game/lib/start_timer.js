var constants = require('../constants');

// Запускаем таймер, по истечении которого будет выполнен заданный обработчик игры
module.exports = function(func) {
  return setTimeout(function() {
    func(true, null, null);
  }, constants.TIMEOUT * 1000);
};