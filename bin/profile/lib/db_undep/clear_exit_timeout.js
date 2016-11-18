/*
    Сбросить таймаут отключения сокета
 */
module.exports = function() {
  clearTimeout(this._pIsExitTimeout);
};