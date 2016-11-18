/*
    Добавить приватный чат  в список открытых чатов
 */
module.exports = function(companion, firstDate, secondDate) {
  
  var cid = companion.getID();
  
  // Если уже есть такой чат, ничего не делаем
  for(var i = 0; i < this._pIsPrivateChats.length; i++) {
    if(this._pIsPrivateChats[i].id == cid) {
      return;
    }
  }
  
  var chat = {
    id          : cid,
    vid         : companion.getVID(),
    first_date  : firstDate,
    second_date : secondDate,
    age         : companion.getAge(),
    city        : companion.getCity(),
    country     : companion.getCountry(),
    sex         : companion.getSex()
  };
  
  this._pIsPrivateChats.push(chat);
};
