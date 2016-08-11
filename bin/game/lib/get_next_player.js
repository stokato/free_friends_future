var constants     = require('../../constants');

// Выбибираем следующего игрока определенного пола
module.exports = function (prisonerResuming) {
  var self = this;

  // Определяем - из кого выбирать - из мальчиков или из девочек
  var players, currIndex;
  if(this.currentSex == constants.GIRL) {
    players = this.gRoom.guys;
    currIndex = this.guysIndex;
  } else {
    players = this.gRoom.girls;
    currIndex = this.girlsIndex;
  }

  // Получаем всех игроков одного пола
  var arr = [], player;
  for(var item in players) if(players.hasOwnProperty(item)) {
    player = players[item];
    arr.push({ player : player, index : player.getGameIndex()});
  }

  // Сортируем по индексу
  arr.sort(compareIndex);

  // Если в темнице кто-то есть, получаем его ид
  var prisonerId = null;
  if(this.gPrisoner) {
    prisonerId = this.gPrisoner.id;
  }

  // Получаем игрока с индексом больше текущего
  for(var i = 0; i < arr.length; i++) {

    if(arr[i].index > currIndex) {
      var nextPlayer = arr[i].player;

      // Если он в темнице и его можно освободить, очищаем ее и возвращаем следующего игрока
      if(nextPlayer.getID() == prisonerId) {
        if(prisonerResuming) {
          this.gPrisoner = null;
        }

        // если нет - возвращаем его
      } else {
        return onComplete(nextPlayer);
      }
    }

  }

  // Если текущий последний, берем с начала
  if(arr[0].player.getID() == prisonerId) {
    if(prisonerResuming) {
      this.gPrisoner = null;
    }

    return onComplete(arr[1].player);
  }

  return onComplete(arr[0].player);

  //----------------------
  function onComplete(nextPlayer) {
    // Устанавливаем новые текуще индекс и пол
    if(self.currentSex == constants.GIRL) {
      self.guysIndex = nextPlayer.getGameIndex();
    } else {
      self.girlsIndex = nextPlayer.getGameIndex();
    }
    self.currentSex = nextPlayer.getSex();

    // Возвращаем нового игрока
    return self.getPlayerInfo(nextPlayer);
  }

  function compareIndex(player1, player2) {
    return player1.index - player2.index;
  }
};
