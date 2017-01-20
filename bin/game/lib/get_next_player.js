/**
 * @param isFree - призак - можно ли освободить игрока из темницы
 *
 * Выбиираем следующего игрока определенного пола
 */

const Config    = require('./../../../config.json');

const GUY = Config.user.constants.sex.male;
const GIRL = Config.user.constants.sex.female;

module.exports = function (isFree) {
  let self = this;

  // Определяем - из кого выбирать - из мальчиков или из девочек
  let playersArr, currIndex;
  if(this._currentSex == GIRL) {
    playersArr = this._room.getAllPlayers(GUY);
    currIndex = this._guysIndex;
  } else {
    playersArr = this._room.getAllPlayers(GIRL);
    currIndex = this._girlsIndex;
  }

  // Сортируем по индексу
  playersArr.sort((player1, player2) => {
    return player1.getGameIndex() - player2.getGameIndex();
  });

  // Если в темнице кто-то есть, получаем его ид
  let prisonerId = null;
  if(this._prisoner) {
    prisonerId = this._prisoner.id;
  }

  // Получаем игрока с индексом больше текущего
  for(let i = 0; i < playersArr.length; i++) {

    if(playersArr[i].getGameIndex() > currIndex) {
      let nextPlayerProfile = playersArr[i];

      // Если он в темнице и его можно освободить, очищаем ее и возвращаем следующего игрока
      if(nextPlayerProfile.getID() == prisonerId) {
        if(isFree) {
          this._prisoner = null;
        }

        // если нет - возвращаем его
      } else {
        return onComplete(nextPlayerProfile);
      }
    }

  }

  // Если текущий последний, берем с начала
  if(playersArr[0].getID() == prisonerId) {
    if(isFree) {
      this._prisoner = null;
    }

    return onComplete(playersArr[1]);
  }

  return onComplete(playersArr[0]);

  //----------------------
  function onComplete(nextPlayer) {
    // Устанавливаем новые текуще индекс и пол
    if(self._currentSex == GIRL) {
      self._guysIndex = nextPlayer.getGameIndex();
    } else {
      self._girlsIndex = nextPlayer.getGameIndex();
    }
    self._currentSex = nextPlayer.getSex();

    // Возвращаем нового игрока
    return self.getPlayerInfo(nextPlayer);
  }
  
};
