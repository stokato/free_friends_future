/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Возвращаем случайный профиль
 *
 * @param sex - пол пользователя, excessIds - ид, которые следует исключить
 * @return profile - профиль выбранного пользователя
 */

module.exports = function (sex, excessIds) { excessIds = excessIds || [];
  var players = this.getAllPlayers(sex);
  var targetPlayers = [], isPlayer;
  
  for(var i = 0; i < players.length; i++)  {
    isPlayer = false;
    
    for(var ei = 0; ei < excessIds.length; ei++) if(players[i].getID() == excessIds[ei]) {
      isPlayer = true;
    }
  
    if(isPlayer == false) {
      targetPlayers.push(players[i]);
    }
  }
  
  var rand = Math.floor(Math.random() * targetPlayers.length);
  
  return targetPlayers[rand];
};