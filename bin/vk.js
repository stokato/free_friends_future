var async = require('async');
var db = require('./db_manager');

var sanitize        = require('./sanitizer');
var md5 = require('md5');

var constants = require('./constants');

var oPool = require('./objects_pool');

//var secret_key = "hiUl8U4F9q3BcbAl28va"; // Защищенный ключ приложения
function VK () {

}

VK.prototype.handle = function(req, profiles, callback) { var request = req || {};

// Сначала проверка
  var sig = request["sig"];

  var fields= [];
  for(var key in request) /* if(request.hasOwnProperty(key)) */{
    if(key === "sig") {  continue; }

    fields.push(key + "=" + request[key]);
  }
  fields.sort();
  var authStr = fields.join("") + constants.APISECRET;

  if (sig !== md5(authStr)) {
    var response = {};
    response['error'] = {
      "error_code" : 10,
      "error_msg"  : 'Несовпадение вычисленной и переданной подписи запроса.',
      "critical"   : true
    };

    var resJSON = JSON.stringify(response);
    return callback(null, resJSON);
  }


  // Обрабатываем запрос
  switch (request["notification_type"]) {
    case "get_item":      getItem(request, callback);
      break;

    case "get_item_test": getItem(request, callback);
      break;

    case "order_status_change": changeOrderStatus(request, profiles, callback);
      break;

    case "order_status_change_test": changeOrderStatus(request, profiles, callback);
      break;
    default : sendError(callback);
  }

  //console.log(request);
};

module.exports = VK;

//--------------------------

function getItem(request, callback) {
  // Получение информации о товаре
  //var f = constants.FIELDS;

  var payInfo = request["item"].split("_");

  var goodId = sanitize(payInfo[0]); // наименование товара

  var response = {};
  db.findGood(goodId, function (err, goodInfo) {
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
        "item_id"   : goodInfo.id,
        "title"     : goodInfo.title,
        "photo_url" : goodInfo.data,
        "price"     : goodInfo.price
      };
    }

    var resJSON = JSON.stringify(response);
    callback(null, resJSON);
  });
}

function changeOrderStatus(request, profiles, callback) {
  // Изменение статуса заказа
  var response = {};
  //var f = constants.FIELDS;

  if (request["status"] == "chargeable") {
    var orderId = request["order_id"];

    var payInfo = request["item"].split("_");

    var options = {};
    options.vid      = sanitize(request["user_id"]);
    options.ordervid = orderId;
    options.goodid   = payInfo[0];
    options.price    = sanitize(request["item_price"]);

    async.waterfall([ /////////////////////////////////////////////////////
      function(cb) { // Ищем товар в базе, проверяем, сходится ли цена
        db.findGood(options.goodid, function (err, goodInfo) {
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
        db.findUser(null, options.vid, ["money"], function(err, info) {
          if(err) { return cb(err, null); }

          if (info) {
            cb(null, goodInfo, info);
          } else cb(new Error("Нет такого пользователя"), null);
        });
      },/////////////////////////////////////////////////////////////////////
      function(goodInfo, info, cb) { // Сохраняем заказ и возвращаем внутренний ид заказа

        var newMoney = info.money - goodInfo.price;
        if(newMoney < 0 && goodInfo.goodtype != constants.GT_MONEY) {
          return cb(new Error("Недостаточно средств на счете"), null);
        }

        var ordOptions = {};
        ordOptions.vid = options.ordervid;
        ordOptions.goodid = goodInfo.goodid;
        ordOptions.userid = info.id;
        ordOptions.uservid = info.vid;
        ordOptions.sum = goodInfo.price;
        ordOptions.date = new Date();

        db.addOrder(ordOptions, function(err, orderid) {
          if (err) { return cb(err, null); }

          cb(null, goodInfo, info, orderid);
        });
      }, ///////////////////////////////////////////////////////////////////////////////
      function(goodInfo, selfInfo, orderid, cb) { // пополняем баланс, себе или другому пользователю
        var options = {};
        options.from_id = selfInfo.id;
        options.from_vid = selfInfo.vid;

        if(payInfo[1]) {
          db.findUser(null, payInfo[1], ["money"], function(err, info) {
            if(err) { return cb(err, null); }

            if (info) {
              //cb(null, goodInfo, info);

              options.id = info.id;
              options.vid = info.vid;
              options.money = info.money + goodInfo.price2;

              db.updateUser(options, function(err, id) {
                if (err) { return cb(err, null); }

                options.money = goodInfo.price2;
                //socket.emit('give_money', options);

                if(profiles[options.id]) {
                  var socket = profiles[options.id].getSocket();
                  socket.emit('give_money', options);

                  var roomList = oPool.roomList;
                  var room = roomList[socket.id];
                  if(room) {
                    socket.broadcast.in(room.name).emit('give_money', options);
                  }
                }

                var result = {};
                result.orderid = orderid;
                cb(null, result);
              });
            } else cb(new Error("Неверно указан vid пользователя - получателя товара"), null);
          });
        } else {
          options.id = selfInfo.id;
          options.vid = selfInfo.vid;
          options.money = selfInfo.money + goodInfo.price2;

          db.updateUser(options, function(err, id) {
            if (err) { return cb(err, null); }

            options.money = goodInfo.price2;
            //socket.emit('give_money', options);

            if(profiles[options.id]) {
              profiles[options.id].getSocket().emit('give_money', options);
            }

            var result = {};
            result.orderid = orderid;
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
          "app_order_id": res.orderid
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