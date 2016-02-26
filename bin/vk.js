var async = require('async');
var db = require('./db');
var dbManager = new db();

//var secret_key = "hiUl8U4F9q3BcbAl28va"; // Защищенный ключ приложения
function VK () {

}

VK.prototype.handle = function(req, callback) {
  // Сначала проверка
  var request = JSON.parse(req);
  var sig = request["sig"];

  //...
  var response = {};
  switch (request["notification_type"]) {
    case "get_item":
      // Получение информации о товаре
      var goodId = request["item"]; // наименование товара

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
            "item_id" : goodInfo.itemId,
            "title"   : goodInfo.title,
            "photo_url" : goodInfo.src,
            "price"   : goodInfo.price
          };
        }
      });
      break;

    case "get_item_test":
      // Получение информации о товаре в тестовом режиме
      item = input["item"];
      var goodId = request["item"];
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
            "item_id" : goodInfo.itemId,
            "title"   : goodInfo.title,
            "photo_url" : goodInfo.src,
            "price"   : goodInfo.price
          };
        }
      });
      break;

    case "order_status_change":
      // Изменение статуса заказа
      if (input["status"] == "chargeable") {
        var orderId = request["order_id"];
        var options = {
          vid: request["user_id"],
          ordervid : orderId,
          goodid: request["item"],
          price: request["item_price"]
        };
        async.waterfall([ /////////////////////////////////////////////////////
          function(cb) { // Ищем товар в базе, проверяем, сходится ли цена
            dbManager.findGood(options.goodid, function (err, goodInfo) {
              if (err) { return cb(err, null) }

              if (goodInfo) {
                if(goodInfo.price != options.price)
                  cb(new Error("Неверно указана цена товара"), null);
                else
                  cb(null, goodInfo);
              } else cb(new Error("Нет такого подарка"), null);
            });
          },/////////////////////////////////////////////////////////////////
          function(goodInfo, cb) { // Ищем пользователя в базе
            dbManager.findUser(null, options.vid, [], function(err, info) {
              if(err) { return cb(err, null); }

              if (info) {
                cb(null, goodInfo, info);
              } else cb(new Error("Нет такого пользователя"), null);
            });
          },/////////////////////////////////////////////////////////////////////
          function(goodInfo, info, cb) { // Сохраняем заказ и возвращаем внутренний ид заказа
            var options = {
              vid     : options.ordervid,
              goodid  : goodInfo.id,
              userid  : info.id,
              uservid : info.vid,
              sum     : goodInfo.price,
              date    : new Date()
            };

            dbManager.addOrder(options, function(err, orderid) {
              if (err) { return cb(err, null); }

              cb(null, {orderid : orderid});
            });
          } ///////////////////////////////////////////////////////////////////////////////
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
              "app_order_id": res.orderid
            };
          }
        });
      } else {
        response["error"] = {
          "error_code": 100,
          "error_msg": "Передано непонятно что вместо chargeable.",
          "critical": true
        };
      }
      break;

    case "order_status_change_test":
      // Изменение статуса заказа в тестовом режиме
      if (input["status"] == "chargeable") {
        var orderId = request["order_id"];
        var options = {
          vid: request["user_id"],
          ordervid : orderId,
          goodid: request["item"],
          price: request["item_price"]
        };

        async.waterfall([ /////////////////////////////////////////////////////
          function(cb) { // Ищем товар в базе, проверяем, сходится ли цена
            dbManager.findGood(options.goodid, function (err, goodInfo) {
              if (err) { return cb(err, null) }

              if (goodInfo) {
                if(goodInfo.price != options.price)
                  cb(new Error("Неверно указана цена товара"), null);
                else
                  cb(null, goodInfo);
              } else cb(new Error("Нет такого подарка"), null);
            });
          },/////////////////////////////////////////////////////////////////
          function(goodInfo, cb) { // Ищем пользователя в базе
            dbManager.findUser(null, options.vid, [], function(err, info) {
              if(err) { return cb(err, null); }

              if (info) {
                cb(null, goodInfo, info);
              } else cb(new Error("Нет такого пользователя"), null);
            });
          },/////////////////////////////////////////////////////////////////////
          function(goodInfo, info, cb) { // Сохраняем заказ и возвращаем внутренний ид заказа
            var options = {
              vid     : options.ordervid,
              goodid  : goodInfo.id,
              userid  : info.id,
              uservid : info.vid,
              sum     : goodInfo.price,
              date    : new Date()
            };

            dbManager.addOrder(options, function(err, orderid) {
              if (err) { return cb(err, null); }

              cb(null, {orderid : orderid});
            });
          } ///////////////////////////////////////////////////////////////////////////////
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
              "app_order_id": res.orderid
            };
          }
        });
      } else {
        response["error"] = {
          "error_code": 100,
          "error_msg": "Передано непонятно что вместо chargeable.",
          "critical": true
        };
      }
      break;
  }
  var resJSON = JSON.stringify(response);
  callback(null, resJSON);
};

module.exports = VK;
