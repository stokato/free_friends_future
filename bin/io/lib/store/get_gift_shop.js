/**
 * Получаем коллекции подарков, сгруппированных по категоирям
 *
 * @param socket, options, callback
 * @return {Object} - объект с подарками
 */

const Config      = require('./../../../../config.json');
const constants   = require('./../../../constants');
const db          = require('./../../../db_manager');
const emitRes     = require('./../../../emit_result');

const PF          = constants.PFIELDS;
const CONST_TYPE  = Config.good_types.gift;

module.exports = function (socket, options) {
  
  // Получаем все подраки
  db.findAllGoods(CONST_TYPE, function (err, goods) {
    if (err) { return emitRes(err, socket, constants.IO_GET_GIFT_SHOP); }
    
    // Сортируем по типу
    goods.sort(function (gift1, gift2) {
      if(gift1[PF.GROUP] < gift2[PF.GROUP]) return -1;
      if(gift2[PF.GROUP] < gift1[PF.GROUP]) return 1;
      return 0;
    });
    
    // Выбираем все типы
    let types = {};
    for(let i = 0; i < goods.length; i++) {
      let group = goods[i][PF.GROUP_TITLE];
      if(!types[group]) {
        types[group] = {
          [PF.GIFTS] : [],
          [PF.TYPE]  : group
        };
      }
    }
    
    // Группируем подарки по типам
    for(let i = 0; i < goods.length; i++) {
      let group = goods[i][PF.GROUP_TITLE];
      
      types[group].gifts.push({
        [PF.ID]     : goods[i][PF.ID],
        [PF.SRC]    : goods[i][PF.SRC],
        [PF.TYPE]   : group,
        [PF.PRICE]  : goods[i][PF.PRICE],
        [PF.TITLE]  : goods[i][PF.TITLE]
      });
    }
    
    // Формируем массив
    let gifts = [];
    for(let i in types) if(types.hasOwnProperty(i)) {
      gifts.push(types[i]);
    }
    
    emitRes(null, socket, constants.IO_GET_GIFT_SHOP, { [PF.GIFTS] : gifts });
  });
  
};

