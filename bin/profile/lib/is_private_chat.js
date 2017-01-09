/**
 * Проверяем, октрыт ли чат с таким пользователем
 * @param id - ид пользователя
 * @return {boolean}
 */

module.exports = function(id) {
  let chats = this._pIsPrivateChats;

  for(let i = 0; i < chats.length; i++) {
    if(chats[i] == id) { return true; }
  }

  return false;
};