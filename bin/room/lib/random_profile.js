/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Возвращаем случайный профиль
 *
 * @param sex - пол пользователя, excessIds - ид, которые следует исключить
 * @param excessIDArr - исключения
 * @return profile - профиль выбранного пользователя
 */

module.exports = function (sex, excessIDArr = []) {
  let playersArr = this.getAllPlayers(sex);
  let targetPlayersArr = [];
  
  let playersLen = playersArr.length;
  for(let i = 0; i < playersLen; i++)  {
    let isPlayer = false;
    
    let excessLen = excessIDArr.length;
    for(let ei = 0; ei < excessLen; ei++) if(playersArr[i].getID() == excessIDArr[ei]) {
      isPlayer = true;
    }
  
    if(isPlayer == false) {
      targetPlayersArr.push(playersArr[i]);
    }
  }
  
  if(targetPlayersArr.length == 0) {
    return null;
  }
  
  let rand = Math.floor(Math.random() * targetPlayersArr.length);
  
  return targetPlayersArr[rand];
};