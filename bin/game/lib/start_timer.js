// Запустить таймер, по истечении которого будет выполнен заданный обработчик игры
module.exports = function(func, count) {
  return setTimeout(function() {
    count = 0;
    func();
  }, TIMEOUT * 1000);
};