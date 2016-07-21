var async = require('async');
var db = require('./db');
var dbManager = new db();

var constants = require('./io/constants');

//var secret_key = "hiUl8U4F9q3BcbAl28va"; // Защищенный ключ приложения
function VK () {

}

VK.prototype.handle = function(req, callback) { var request = req || {};
// Сначала проверка

  var sig = request["sig"];

  //...

  switch (request["notification_type"]) {
    case "get_item":      getItem(request, callback);
      break;

    case "get_item_test": getItem(request, callback);
      break;

    case "order_status_change": changeOrderStatus(request, callback);
      break;

    case "order_status_change_test": changeOrderStatus(request, callback);
      break;
    default : sendError(callback);
  }

  console.log(request);
};

module.exports = VK;



function getItem(request, callback) {
  // Получение информации о товаре
  var f = constants.FIELDS;

  var payInfo = request["item"].split("_");

  var goodId = payInfo[0]; // наименование товара

  var response = {};
  dbManager.findGood(goodId, function (err, goodInfo) {
    if(err) {
      response["error"] = {
        "error_code" : err.code,
        "error_msg"  : err.message,
        "critical"   : true
      };
    } else if(!goodInfo) {
      response["error"] = {
        "error_code" : 20,
        "error_msg"  : "Нет такого товара",
        "critical"   : true
      };
    } else {
      response["response"] = {
        "item_id"   : goodInfo[f.id],
        "title"     : goodInfo[f.title],
        "photo_url" : goodInfo[f.data],
        "price"     : goodInfo[f.price]
      };
    }

    var resJSON = JSON.stringify(response);
    callback(null, resJSON);
  });
}

function changeOrderStatus(request, callback) {
  // Изменение статуса заказа
  var response = {};
  var f = constants.FIELDS;

  if (request["status"] == "chargeable") {
    var orderId = request["order_id"];

    var payInfo = request["item"].split("_");

    var options = {};
    options[f.vid]      = request["user_id"];
    options[f.ordervid] = orderId;
    options[f.goodid]   = payInfo[0];
    options[f.price]    = request["item_price"];

    async.waterfall([ /////////////////////////////////////////////////////
      function(cb) { // Ищем товар в базе, проверяем, сходится ли цена
        dbManager.findGood(options.goodid, function (err, goodInfo) {
          if (err) { return cb(err, null) }

          if (goodInfo) {
            if(goodInfo[f.price] != options[f.price])
              cb(new Error("Неверно указана цена товара"), null);
            else
              cb(null, goodInfo);
          } else cb(new Error("Нет такого подарка"), null);
        });
      },/////////////////////////////////////////////////////////////////
      function(goodInfo, cb) { // Ищем пользователя в базе
        dbManager.findUser(null, options[f.vid], [f.money], function(err, info) {
          if(err) { return cb(err, null); }

          if (info) {
            cb(null, goodInfo, info);
          } else cb(new Error("Нет такого пользователя"), null);
        });
      },/////////////////////////////////////////////////////////////////////
      function(goodInfo, info, cb) { // Сохраняем заказ и возвращаем внутренний ид заказа

        var newMoney = info[f.money] - goodInfo[f.price];
        if(newMoney < 0 && goodInfo[f.goodtype] != constants.GT_MONEY) {
          return cb(new Error("Недостаточно средств на счете"), null);
        }

        var ordOptions = {};
        ordOptions[f.vid] = options.ordervid;
        ordOptions[f.goodid] = goodInfo[f.id];
        ordOptions[f.userid] = info[f.id];
        ordOptions[f.uservid] = info[f.vid];
        ordOptions[f.sum] = goodInfo[f.price];
        ordOptions[f.date] = new Date();

        dbManager.addOrder(ordOptions, function(err, orderid) {
          if (err) { return cb(err, null); }

          cb(null, goodInfo, info, orderid);
        });
      }, ///////////////////////////////////////////////////////////////////////////////
      function(goodInfo, info, orderid, cb) { // пополняем баланс, себе или другому пользователю
        var options = {};

        if(payInfo[1]) {
          dbManager.findUser(null, payInfo[1], [f.money], function(err, info) {
            if(err) { return cb(err, null); }

            if (info) {
              //cb(null, goodInfo, info);

              options[f.id] = info[f.id];
              options[f.vid] = info[f.vid];
              options[f.money] = info[f.money] + goodInfo[f.price2];

              dbManager.updateUser(options, function(err, id) {
                if (err) { return cb(err, null); }

                var result = {};
                result[f.orderid] = orderid;
                cb(null, result);
              });
            } else cb(new Error("Неверно указан vid пользователя - получателя товара"), null);
          });
        } else {
          options[f.id] = info[f.id];
          options[f.vid] = info[f.vid];
          options[f.money] = info[f.money] + goodInfo[f.price2];

          dbManager.updateUser(options, function(err, id) {
            if (err) { return cb(err, null); }

            var result = {};
            result[f.orderid] = orderid;
            cb(null, result);
          });
        }
      } //////////////////////////////////////////////////////////////////////////////////
    ], function(err, res) { // Обрабатываем ошибки и возвращаем результат
      if (err) {
        response["error"] = {
          "error_code": err.code,
          "error_msg": err.message,
          "critical": true
        };
      } else {
        response["response"] = {
          "order_id": orderId,
          "app_order_id": res[f.orderid]
        };
      }

      var resJSON = JSON.stringify(response);
      callback(null, resJSON);
    });
  } else {
    response["error"] = {
      "error_code": 100,
      "error_msg": "Передано непонятно что вместо chargeable.",
      "critical": true
    };

    var resJSON = JSON.stringify(response);
    callback(null, resJSON);
  }
}

function sendError(callback) {
  var response = {};
  response["error"] = {
    "error_code": 100,
    "error_msg": "Не удалось распознать запрос",
    "critical": true
  };

  var resJSON = JSON.stringify(response);
  callback(null, resJSON);
}