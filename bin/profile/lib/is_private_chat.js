/**
 * Проверяем, октрыт ли чат с таким пользователем
 * @param id - ид пользователя
 * @return {boolean}
 */

module.exports = function(id) {
  var chats = this._pIsPrivateChats;

  for(var i = 0; i < chats.length; i++) {
    if(chats[i] == id) { return true; }
  }

  return false;
};