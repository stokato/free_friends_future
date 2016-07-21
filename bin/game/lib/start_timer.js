var constants = require('../constants');

// Запускаем таймер, по истечении которого будет выполнен заданный обработчик игры
module.exports = function(func, timeout) {
  return setTimeout(function() {
    func(true, null, null);
  }, timeout);
};