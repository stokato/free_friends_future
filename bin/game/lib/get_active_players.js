/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 *
 * Получаем все пользователей, которым разрешено делать выбор
 */

module.exports = function () {
  let playersArr = [];
  for(let item in this._activePlayers) if(this._activePlayers.hasOwnProperty(item)) {
    playersArr.push(this._activePlayers[item]);
  }
  return playersArr;
};