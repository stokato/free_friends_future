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

      var i, type, gift;

      goods.sort(compareGiftsOnTypes);

      var types = {};
      for(i = 0; i < goods.length; i++) {
        type = goods[i][f.type];
        if(!types[type]) {
          types[type] = {};
          types[type][f.gifts] = [];
          types[type][f.type] = type;
        }
      }

      for(i = 0; i < goods.length; i++) {
        gift = {};
        type = goods[i][f.type];
        gift[f.id]   = goods[i][f.id];
        gift[f.src]  = goods[i][f.data];
        gift[f.type] = type;
        gift[f.price] = 30;
        gift[f.title] = goods[i][f.title];

        types[type][f.gifts].push(gift);
      }

      var gifts = [];
      for(i in types) if(types.hasOwnProperty(i)) {
        gifts.push(types[i]);
      }

      //
      //var gifts = [], gift;
      //var oldType = null;
      //for(var i = 0; i < goods.length; i++) {
      //
      //  if(goods[i][f.type] != oldType) {
      //    gifts.push({});
      //    gifts[gifts.length-1][f.name] = goods[i][f.type];
      //    gifts[gifts.length-1][f.gifts] = [];
      //    oldType = goods[i][f.type];
      //  }
      //
      //  gift = {};
      //  gift[f.id]   = goods[i][f.id];
      //  gift[f.src]  = goods[i][f.data];
      //  gift[f.type] = goods[i][f.type];
      //  gift[f.price] = 30;
      //  gift[f.title] = goods[i][f.title];
      //  gifts[gifts.length-1][f.gifts].push(gift);
      //}

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