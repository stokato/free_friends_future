// Запускаем таймер, по истечении которого будет выполнен заданный обработчик игры
module.exports = function(func, timeout) {
  this._timer = setTimeout(function() {  func(true); }, timeout);
};