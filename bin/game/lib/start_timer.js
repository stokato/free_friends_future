// Запустить таймер, по истечении которого будет выполнен заданный обработчик игры
module.exports = function(func) {
  return setTimeout(function() {
    func(true);
  }, TIMEOUT * 1000);
};