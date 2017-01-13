// Запускаем таймер, по истечении которого будет выполнен заданный обработчик игры
module.exports = function(func, timeout, game) {
  this._timer = setTimeout(function() {
    func(game); }, timeout);
};