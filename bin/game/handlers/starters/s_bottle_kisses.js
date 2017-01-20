/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Начало этапа раунда Бутылочка - Поцелуи
 * Получаем первого и второго игроков
 * Разрешаем обоим делать выбор
 * Отпрвляем настройки игры
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 */

const Config  = require('./../../../../config.json');
const PF      = require('./../../../const_fields');

module.exports = function (game) {
  
  const DEF_TIMEOUT = Number(Config.game.timeouts.default);
  
  game.setNextGame(game.CONST.G_BOTTLE_KISSES);
  
  let playersArr = game.getStoredOptions();
  let rand = Math.floor(Math.random() * playersArr.length);
  let spInfoObj = playersArr[rand];
  
  // Разрешаем второму игроку ходить
  game.setActivePlayer(spInfoObj.id, spInfoObj);
  
  // Оба могут ответить по разу
  game.clearActionsQueue();
  game.setActionLimit(1);
  game.setActionsCount(2);
  game.setActionsMain(2);
  
  // Отправляем результаты
  let resultObj = {
    [PF.PLAYERS]  : game.getPlayersID(),
    [PF.NEXTGAME] : game.CONST.G_BOTTLE_KISSES,
    [PF.PRISON]   : null
  };
  
  game.checkPrisoner(resultObj);
  
  game.sendData(resultObj);
  game.setGameState(resultObj);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_BOTTLE_KISSES, game.CONST.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_BOTTLE_KISSES, game.CONST.GT_ON)(game));
};