const constants     = require('../../constants');

// Выбибираем следующего игрока определенного пола
module.exports = function (prisonerResuming) {
  let self = this;

  // Определяем - из кого выбирать - из мальчиков или из девочек
  let players, currIndex;
  if(this._currentSex == constants.GIRL) {
    players = this._room.getAllPlayers(constants.GUY);
    currIndex = this._guysIndex;
  } else {
    players = this._room.getAllPlayers(constants.GIRL);
    currIndex = this._girlsIndex;
  }

  // Сортируем по индексу
  players.sort(function (player1, player2) {
    return player1.getGameIndex() - player2.getGameIndex();
  });

  // Если в темнице кто-то есть, получаем его ид
  let prisonerId = null;
  if(this._prisoner) {
    prisonerId = this._prisoner.id;
  }

  // Получаем игрока с индексом больше текущего
  for(let i = 0; i < players.length; i++) {

    if(players[i].getGameIndex() > currIndex) {
      let nextPlayer = players[i];

      // Если он в темнице и его можно освободить, очищаем ее и возвращаем следующего игрока
      if(nextPlayer.getID() == prisonerId) {
        if(prisonerResuming) {
          this._prisoner = null;
        }

        // если нет - возвращаем его
      } else {
        return onComplete(nextPlayer);
      }
    }

  }

  // Если текущий последний, берем с начала
  if(players[0].getID() == prisonerId) {
    if(prisonerResuming) {
      this._prisoner = null;
    }

    return onComplete(players[1]);
  }

  return onComplete(players[0]);

  //----------------------
  function onComplete(nextPlayer) {
    // Устанавливаем новые текуще индекс и пол
    if(self._currentSex == constants.GIRL) {
      self._guysIndex = nextPlayer.getGameIndex();
    } else {
      self._girlsIndex = nextPlayer.getGameIndex();
    }
    self._currentSex = nextPlayer.getSex();

    // Возвращаем нового игрока
    return self.getPlayerInfo(nextPlayer);
  }
  
};
