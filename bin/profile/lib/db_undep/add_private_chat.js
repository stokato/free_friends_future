/*
Добавить приватный чат: ид и вид
  Добавляем в список открытых чатов
 */
module.exports = function(companion, firstDate, secondDate) {
  
  var cid = companion.getID();
  
  for(var i = 0; i < this.pPrivateChats.length; i++) {
    if(this.pPrivateChats[i].id == cid) {
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
  
  this.pPrivateChats.push(chat);
};
