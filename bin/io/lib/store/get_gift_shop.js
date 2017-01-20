/**
 * Получаем коллекции подарков, сгруппированных по категоирям
 *
 * @param socket, options, callback
 * @return {Object} - объект с подарками
 */

const Config      = require('./../../../../config.json');
const PF          = require('./../../../const_fields');
const db          = require('./../../../db_manager');
const oPool       = require('./../../../objects_pool');

const emitRes     = require('./../../../emit_result');

module.exports = function (socket, options) {
  
  const CONST_TYPE  = Config.good_types.gift;
  
  // Получаем все подраки
  db.findAllGoods(CONST_TYPE, (err, goods) => {
    if (err) {
      return emitRes(err, socket, Config.io.emits.IO_GET_GIFT_SHOP);
    }
  
    let setfProfile = oPool.userList[socket.id];
    let room = oPool.roomList[socket.id];
    let ranksCtrlr = room.getRanks();
  
    let uid = setfProfile.getID();
  
    // Сортируем по типу
    goods.sort((gift1, gift2) => {
      if (gift1[PF.GROUP] < gift2[PF.GROUP]) return -1;
      if (gift2[PF.GROUP] < gift1[PF.GROUP]) return 1;
      return 0;
    });
  
    // Выбираем все типы
    let types = {};
    for (let i = 0; i < goods.length; i++) {
      let group = goods[i][PF.GROUP_TITLE];
      if (!types[group]) {
        types[group] = {
          [PF.GIFTS]: [],
          [PF.GROUP]: group
        };
      }
    }
  
    // Группируем подарки по типам
    for (let i = 0; i < goods.length; i++) {
      let group = goods[i][PF.GROUP_TITLE];
    
      let isLocked = false;
      
      if(setfProfile.getLevel() < goods[i][PF.LEVEL]) {
        isLocked = true;
      }
  
      if(goods[i][PF.RANK]) {
        isLocked = (ranksCtrlr.getRankOwner(goods[i][PF.RANK]) != uid);
      }
      
      types[group].gifts.push({
        [PF.ID]     : goods[i][PF.ID],
        [PF.SRC]    : goods[i][PF.SRC],
        [PF.GROUP]  : group,
        [PF.PRICE]  : goods[i][PF.PRICE],
        [PF.TITLE]  : goods[i][PF.TITLE],
        [PF.TYPE]   : goods[i][PF.TYPE],
        [PF.LEVEL]  : goods[i][PF.LEVEL] || "0",
        [PF.RANK]   : goods[i][PF.RANK],
        [PF.LOCKED] : isLocked
      });
    }
  
    // Формируем массив
    let gifts = [];
    for (let i in types) if (types.hasOwnProperty(i)) {
      gifts.push(types[i]);
    }
    
    emitRes(null, socket, Config.io.emits.IO_GET_GIFT_SHOP, { [PF.GIFTS]: gifts });
  });
};

