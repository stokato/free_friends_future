var constants = require('./../../../constants'),
    db      = require('./../../../db_manager');

/*
 Получить магазин с подарками
 - Получаем все возможные подарки из базы
 - Отправляем клиенту
 */
module.exports = function (socket, options, callback) {

    db.findAllGoods(constants.GT_GIFT, function (err, goods) {
      if (err) { return callback(err); }

      var i, type, gift;

      goods.sort(function (gift1, gift2) {
        if(gift1["type"] < gift2["type"]) return -1;
        if(gift2["type"] < gift1["type"]) return 1;
        return 0;
      });

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
      
      callback(null, { gifts : gifts });
    });

};

