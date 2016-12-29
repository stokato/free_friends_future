/**
 * Получаем коллекции подарков, сгруппированных по категоирям
 *
 * @param socket, options, callback
 * @return {Object} - объект с подарками
 */

const constants   = require('./../../../constants');
const db          = require('./../../../db_manager');
const emitRes     = require('./../../../emit_result');
const PF          = constants.PFIELDS;

module.exports = function (socket, options) {
  
  // Получаем все подраки
  db.findAllGoods(constants.GT_GIFT, function (err, goods) {
    if (err) { return emitRes(err, socket, constants.IO_GET_GIFT_SHOP); }
    
    var i, type, gift;
    
    // Сортируем по типу
    goods.sort(function (gift1, gift2) {
      if(gift1[PF.TYPE] < gift2[PF.TYPE]) return -1;
      if(gift2[PF.TYPE] < gift1[PF.TYPE]) return 1;
      return 0;
    });
    
    // Выбираем все типы
    var types = {};
    for(i = 0; i < goods.length; i++) {
      type = goods[i][PF.TYPE];
      if(!types[type]) {
        types[type] = {};
        types[type][PF.GIFTS] = [];
        types[type][PF.TYPE] = type;
      }
    }
    
    // Группируем подарки по типам
    for(i = 0; i < goods.length; i++) {
      type            = goods[i][PF.TYPE];
  
      gift = {
        [PF.ID]     : goods[i][PF.ID],
        [PF.SRC]    : goods[i][PF.SRC],
        [PF.TYPE]   : type,
        [PF.PRICE]  : goods[i][PF.PRICE],
        [PF.TITLE]  : goods[i][PF.TITLE]
      };
      
      types[type].gifts.push(gift);
    }
    
    // Формируем массив
    let gifts = [];
    for(i in types) if(types.hasOwnProperty(i)) {
      gifts.push(types[i]);
    }
    
    emitRes(null, socket, constants.IO_GET_GIFT_SHOP, { [PF.GIFTS] : gifts });
  });
  
};

