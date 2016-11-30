/**
 * Получаем коллекции подарков, сгруппированных по категоирям
 *
 * @param socket, options, callback
 * @return {Object} - объект с подарками
 */

var constants = require('./../../../constants'),
  PF        = constants.PFIELDS,
  db      = require('./../../../db_manager');

module.exports = function (socket, options, callback) {
  
  // Получаем все подраки
  db.findAllGoods(constants.GT_GIFT, function (err, goods) {
    if (err) { return callback(err); }
    
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
      gift = {};
      type            = goods[i][PF.TYPE];
      gift[PF.ID]     = goods[i][PF.ID];
      gift[PF.SRC]    = goods[i][PF.SRC];
      gift[PF.TYPE]   = type;
      gift[PF.PRICE]  = goods[i][PF.PRICE];
      gift[PF.TITLE]  = goods[i][PF.TITLE];
      
      types[type].gifts.push(gift);
    }
    
    // Формируем массив
    var gifts = [];
    for(i in types) if(types.hasOwnProperty(i)) {
      gifts.push(types[i]);
    }
    
    var res = {};
    res[PF.GIFTS] = gifts;
    
    callback(null, res);
  });
  
};

