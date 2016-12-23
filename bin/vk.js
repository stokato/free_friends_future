/**
 * Модуль обработки запросов от Вконтакте
 */

var async = require('async');
var db = require('./db_manager');

var sanitize        = require('./sanitizer');
var md5 = require('md5');

var constants = require('./constants');
var PF = constants.PFIELDS;

var oPool = require('./objects_pool');
var stat = require('./stat_manager');
var Config = require('./../config.json');

var REFILL_POINTS = Number(Config.points.refill);

function VK () {}

VK.prototype.handle = function(req, profiles, callback) {
  var request = req || {};

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

    case "order_status_change": changeOrderStatus(request, profiles, stat, callback);
      break;

    case "order_status_change_test": changeOrderStatus(request, profiles, stat, callback);
      break;
    default : sendError(callback);
  }

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
        "item_id"   : goodInfo[PF.ID],
        "title"     : goodInfo[PF.TITLE],
        "photo_url" : goodInfo[PF.DATE],
        "price"     : goodInfo[PF.PRICE]
      };
    }

    var resJSON = JSON.stringify(response);
    callback(null, resJSON);
  });
}

function changeOrderStatus(request, profiles, stat, callback) {
  // Изменение статуса заказа
  var response = {};

  if (request["status"] == "chargeable") {
    var orderId = request["order_id"];

    var payInfo = request["item"].split("_");

    var options = {};
    options[PF.VID]      = sanitize(request["user_id"]);
    options[PF.ORDERVID] = orderId;
    options[PF.GOODID]   = payInfo[0];
    options[PF.PRICE]    = sanitize(request["item_price"]);

    async.waterfall([ /////////////////////////////////////////////////////
      function(cb) { // Ищем товар в базе, проверяем, сходится ли цена
        db.findGood(options[PF.GOODID], function (err, goodInfo) {
          if (err) { return cb(err, null) }

          if (goodInfo) {
            if(goodInfo[PF.PRICE] != options[PF.PRICE])
              cb(new Error("Неверно указана цена товара"), null);
            else
              cb(null, goodInfo);
          } else cb(new Error("Нет такого подарка"), null);
        });
      },/////////////////////////////////////////////////////////////////
      function(goodInfo, cb) { // Ищем пользователя в базе
        db.findUser(null, options[PF.VID], [PF.MONEY], function(err, info) {
          if(err) { return cb(err, null); }

          if (info) {
            cb(null, goodInfo, info);
          } else cb(new Error("Нет такого пользователя"), null);
        });
      },/////////////////////////////////////////////////////////////////////
      function(goodInfo, info, cb) { // Сохраняем заказ и возвращаем внутренний ид заказа

        var newMoney = info[PF.MONEY] - goodInfo[PF.PRICE];
        if(newMoney < 0 && goodInfo[PF.GOODTYPE] != constants.GT_MONEY) {
          return cb(new Error("Недостаточно средств на счете"), null);
        }

        var ordOptions = {};
        ordOptions[PF.ORDERVID]   = options[PF.ORDERVID];
        ordOptions[PF.GOODID]     = goodInfo[PF.ID];
        ordOptions[PF.ID]         = info[PF.ID];
        ordOptions[PF.VID]        = info[PF.VID];
        ordOptions[PF.SUM]        = goodInfo[PF.PRICE];
        ordOptions[PF.DATE]       = new Date();

        db.addOrder(ordOptions, function(err, orderid) {
          if (err) { return cb(err, null); }

          cb(null, goodInfo, info, orderid);
        });
      }, ///////////////////////////////////////////////////////////////////////////////
      function(goodInfo, selfInfo, orderid, cb) { // пополняем баланс, себе или другому пользователю
        var options = {};
        options.from_id = selfInfo[PF.ID];
        options.from_vid = selfInfo[PF.VID];

        if(payInfo[1]) {
          db.findUser(null, payInfo[1], [PF.MONEY], function(err, info) {
            if(err) { return cb(err, null); }

            if (info) {

              options[PF.ID]    = info[PF.ID];
              options[PF.VID]   = info[PF.VID];
              options[PF.MONEY] = info[PF.MONEY] + goodInfo[PF.PRICE2];

              db.updateUser(options, function(err, id) {
                if (err) { return cb(err, null); }

                options[PF.MONEY] = goodInfo[PF.PRICE2];
                
                stat.setUserStat(selfInfo[PF.ID], selfInfo[PF.VID], constants.SFIELDS.COINS_GIVEN, options[PF.MONEY]);
                
                var field = getField(payInfo[0], false);
                stat.setMainStat(field, 1);
                
                if(profiles[options[PF.ID]]) {
                  var socket = profiles[options[PF.ID]].getSocket();
                  socket.emit(constants.IO_GIVE_MONEY, options);

                  var roomList = oPool.roomList;
                  var room = roomList[socket.id];
                  if(room) {
                    socket.broadcast.in(room.getName()).emit(constants.IO_GIVE_MONEY, options);
                  }
                }

                options = {};
                options[PF.ID]     = selfInfo[PF.ID];
                options[PF.VID]    = selfInfo[PF.VID];
                options[PF.POINTS] = selfInfo[PF.POINTS] + goodInfo[PF.PRICE2] * REFILL_POINTS;
                db.updateUser(options, function (err) {
                  if(err) { return cb(err, null); }
  
                  var result = {};
                  result.orderid = orderid;
                  cb(null, result);
                });
                
              });
            } else cb(new Error("Неверно указан vid пользователя - получателя товара"), null);
          });
        } else {
          options[PF.ID]    = selfInfo[PF.ID];
          options[PF.VID]   = selfInfo[PF.VID];
          options[PF.MONEY] = selfInfo[PF.MONEY] + goodInfo[PF.PRICE2];
          options[PF.POINTS] = selfInfo[PF.POINTS] + goodInfo[PF.PRICE2] * REFILL_POINTS;

          db.updateUser(options, function(err) {
            if (err) { return cb(err, null); }

            options.money = goodInfo[PF.PRICE2];

            if(profiles[options.id]) {
              profiles[options.id].getSocket().emit(constants.IO_GIVE_MONEY, options);
            }
            
            var field = getField(payInfo[0], true);
            stat.setMainStat(field, 1);

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

function getField (goodID, isSelf) {
  var SF = constants.SFIELDS;
  var LOTS = constants.MONEY_LOTS;
  var field;
  
  switch (goodID) {
    case LOTS.COIN_1    : (isSelf)? field = SF.MONEY_1_TAKEN    : field = SF.MONEY_1_GIVEN;     break;
    case LOTS.COIN_3    : (isSelf)? field = SF.MONEY_3_TAKEN    : field = SF.MONEY_3_GIVEN;     break;
    case LOTS.COIN_10   : (isSelf)? field = SF.MONEY_10_TAKEN   : field = SF.MONEY_10_GIVEN;    break;
    case LOTS.COIN_20   : (isSelf)? field = SF.MONEY_20_TAKEN   : field = SF.MONEY_20_GIVEN;    break;
    case LOTS.COIN_60   : (isSelf)? field = SF.MONEY_60_TAKEN   : field = SF.MONEY_60_GIVEN;    break;
    case LOTS.COIN_200  : (isSelf)? field = SF.MONEY_200_TAKEN  : field = SF.MONEY_200_GIVEN;   break;
  }
  
  return field;
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