var dbjs      = require('./../../db/index'),
    GameError = require('./../../game_error'),
    checkInput = require('./../../check_input'),
    constants = require('./../constants');

var db = new dbjs();
/*
 Получить магазин с подарками
 - Получаем все возможные подарки из базы
 - Отправляем клиенту
 */
module.exports = function (socket, userList) {
  socket.on(constants.IO_GET_GIFT_SHOP, function() {
    var f = constants.FIELDS;

    if (!checkInput(constants.IO_GET_GIFT_SHOP, socket, userList, {})) { return; }

    db.findAllGoods(constants.GT_GIFT, function (err, goods) {
      if (err) { return new GameError(socket, constants.IO_GET_GIFT_SHOP, err.message); }

      goods.sort(compareGiftsOnTypes);

      var gifts = [], gift;
      var oldType = null;
      for(var i = 0; i < goods.length; i++) {
        if(goods[i][f.type] != oldType) {
          gifts.push({});
          gifts[gifts.length-1][f.name] = goods[i][f.type];
          gifts[gifts.length-1][f.gifts] = [];
          oldType = goods[i][f.type];
        }
        gift = {};
        gift[f.id]   = goods[i][f.id];
        gift[f.src]  = goods[i][f.data];
        gifts[gifts.length-1][f.gifts].push(gift);
      }

      socket.emit(constants.IO_GET_GIFT_SHOP, gifts);
    });
  });
};

function compareGiftsOnTypes(gift1, gift2) {
  //return gift1[constants.FIELDS.type] > gift2[constants.FIELDS.type];
  if(gift1[constants.FIELDS.type] < gift2[constants.FIELDS.type]) return -1;
  if(gift2[constants.FIELDS.type] < gift1[constants.FIELDS.type]) return 1;
  return 0;
};