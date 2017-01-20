/**
 * @param func
 * @param timeout
 * @param game
 *
 * Запускаем таймер, по истечении которого будет выполнен обработчик игры
 */
module.exports = function(func, timeout, game) {
  this._timer = setTimeout(function() {
    func(game); }, timeout);
};