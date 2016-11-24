/*
    Добавить приватный чат  в список открытых чатов
 */
module.exports = function(companion, firstDate, secondDate) {
  
  var cid = companion.getID();
  
  // Если уже есть такой чат, ничего не делаем
  for(var i = 0; i < this._pIsPrivateChats.length; i++) {
    if(this._pIsPrivateChats[i] == cid) {
      return;
    }
  }
  
  this._pIsPrivateChats.push(cid);
};
