var dbjs      = require('./../../db/index'),
    GameError = require('./../../game_error'),
    checkInput = require('./../../check_input'),
    constants = require('./../../constants');

var oPool = require('./../../objects_pool');

var db = new dbjs();
/*
 Получить магазин с подарками
 - Получаем все возможные подарки из базы
 - Отправляем клиенту
 */
module.exports = function (socket) {
  socket.on(constants.IO_GET_GIFT_SHOP, function(options) {
    if (!checkInput(constants.IO_GET_GIFT_SHOP, socket, oPool.userList, options)) { return; }

    db.findAllGoods(constants.GT_GIFT, function (err, goods) {
      if (err) { return handError(err); }

      var i, type, gift;

      goods.sort(compareGiftsOnTypes);

      var types = {};
      for(i = 0; i < goods.length; i++) {
        type = goods[i]["type"];
        if(!types[type]) {
          types[type] = {};
          types[type].gifts = [];
          types[type].type = type;
        }
      }

      for(i = 0; i < goods.length; i++) {
        gift = {};
        type = goods[i]["type"];
        gift.id   = goods[i]["id"];
        gift.src  = goods[i]["src"];
        gift.type = type;
        gift.price = 30;
        gift.title = goods[i].title;

        types[type].gifts.push(gift);
      }

      var gifts = [];
      for(i in types) if(types.hasOwnProperty(i)) {
        gifts.push(types[i]);
      }
      ;

      socket.emit(constants.IO_GET_GIFT_SHOP, {
        gifts : gifts,
        operation_status : constants.RS_GOODSTATUS
      });
    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GET_GIFT_SHOP, res);

      new GameError(socket, constants.IO_GET_GIFT_SHOP, err.message || constants.errors.OTHER.message);
    }

    function compareGiftsOnTypes(gift1, gift2) {
      //return gift1[constants.FIELDS.type] > gift2[constants.FIELDS.type];
      if(gift1["type"] < gift2["type"]) return -1;
      if(gift2["type"] < gift1[".type"]) return 1;
      return 0;
    };
  });
};

