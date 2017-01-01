/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Награждаем за достижение
 * Запускаем таймер, который периодически начисляет бонусы обладателю звания
 * Таймер останавливается при смене обладателя
 * Бонусы начисляются не более установленного лимита
 *
 */

const Config    = require('./../../../config.json');

module.exports = function (rank, uid) {
  
  let bonusLimit    = Number(Config.ranks[rank].bonus_limit);
  let bonusTimeout  = Number(Config.ranks[rank].bonus_timeout);
  
  this._rBonuses[rank] ++;
  
  // Выполняем обработчик - если есть
  if(this._onRankBonus[rank]) {
    this._onRankBonus[rank](null, uid);
  }
  
  startTimer(this, rank, uid, bonusLimit, bonusTimeout);
  
  //------------------------------------------------
  function startTimer(rm, rank, uid, limit, delay) {
    setTimeout(function () {
      // Если владелец сменился - ничего не делаем
      if(rm._rRankOwners[rank] != uid) { return; }
      
      // Начисляем бонус, если не превышен лимит
      if(rm._rBonuses[rank] < limit) {
        rm._rBonuses[rank] ++;
      }
      
      // Выполняем обработчик - если есть
      if(rm._onRankBonus[rank]) {
        rm._onRankBonus[rank](null, uid);
      }
      
      startTimer(rm, rank, uid, limit, delay);
      
    }, delay);
  }
  
};
