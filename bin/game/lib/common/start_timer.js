// Запускаем таймер, по истечении которого будет выполнен заданный обработчик игры
module.exports = function(func, timeout) {
  this.gTimer = setTimeout(function() {  func(true); }, timeout);
};