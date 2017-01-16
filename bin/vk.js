/**
 * Модуль обработки запросов от Вконтакте
 */

const async = require('async');
const md5   = require('md5');

const Config        = require('./../config.json');
const constants     = require('./constants');
const db            = require('./db_manager');
const oPool         = require('./objects_pool');
const stat          = require('./stat_manager');

const sanitize      = require('./sanitize');
const getUserProfile = require('./io/lib/common/get_user_profile');

const PF            = constants.PFIELDS;
const REFILL_POINTS = Number(Config.points.refill);

function VK () {}

VK.prototype.handle = function(req, callback) {
  let request = req || {};

  // Сначала проверка
  let sig = request["sig"];

  let fields= [];
  for(let key in request) /* if(request.hasOwnProperty(key)) */{
    if(key === "sig") {  continue; }

    fields.push(key + "=" + request[key]);
  }
  fields.sort();
  let authStr = fields.join("") + Config.auth.APISECRET;

  if (sig !== md5(authStr)) {
    let response = {};
    response['error'] = {
      "error_code" : 10,
      "error_msg"  : 'Несовпадение вычисленной и переданной подписи запроса.',
      "critical"   : true
    };

    let resJSON = JSON.stringify(response);
    return callback(null, resJSON);
  }


  // Обрабатываем запрос
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

};

module.exports = VK;

//--------------------------

function getItem(request, callback) {
  // Получение информации о товаре

  let payInfo = request["item"].split("_");

  let goodId = sanitize(payInfo[0]); // наименование товара

  let response = {};
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
        "price"     : goodInfo[PF.PRICE2]
      };
    }

    let resJSON = JSON.stringify(response);
    callback(null, resJSON);
  });
}

function changeOrderStatus(request, callback) {
  // Изменение статуса заказа
  let response = {};

  if (request["status"] == "chargeable") {
    let orderId = request["order_id"];

    let payInfo = request["item"].split("_");

    let options = {
      [PF.VID]      : sanitize(request["user_id"]),
      [PF.ORDERVID] : orderId,
      [PF.GOODID]   : payInfo[0],
      [PF.PRICE]    : sanitize(request["item_price"])
    };
    
    async.waterfall([ /////////////////////////////////////////////////////
      function(cb) { // Ищем товар в базе, проверяем, сходится ли цена
        db.findGood(options[PF.GOODID], function (err, goodInfo) {
          if (err) { return cb(err, null) }

          if (goodInfo) {
            if(goodInfo[PF.PRICE2] != options[PF.PRICE])
              cb(new Error("Неверно указана цена товара"), null);
            else
              cb(null, goodInfo);
          } else cb(new Error("Нет такого подарка"), null);
        });
      },/////////////////////////////////////////////////////////////////
      function(goodInfo, cb) { // Ищем пользователя в базе
        db.findUser(null, options[PF.VID], [PF.MONEY, PF.POINTS], function(err, info) {
          if(err) { return cb(err, null); }

          if (info) {
            getUserProfile(info[PF.ID], function (err, profile) {
              if(err) { return cb(err, null); }
  
              cb(null, goodInfo, info, profile);
            });
          } else cb(new Error("Нет такого пользователя"), null);
        });
      },/////////////////////////////////////////////////////////////////////
      function(goodInfo, info, profile, cb) { // Сохраняем заказ и возвращаем внутренний ид заказа

        let newMoney = info[PF.MONEY] - goodInfo[PF.PRICE];
        if(newMoney < 0 && goodInfo[PF.GOODTYPE] != constants.GT_MONEY) {
          return cb(new Error("Недостаточно средств на счете"), null);
        }

        let ordOptions = {
          [PF.ORDERVID] : options[PF.ORDERVID],
          [PF.GOODID]   : goodInfo[PF.ID],
          [PF.ID]       : info[PF.ID],
          [PF.VID]      : info[PF.VID],
          [PF.SUM]      : goodInfo[PF.PRICE2],
          [PF.DATE]     : new Date()
        };

        db.addOrder(ordOptions, function(err, orderid) {
          if (err) { return cb(err, null); }

          cb(null, goodInfo, info, orderid, profile);
        });
      }, ///////////////////////////////////////////////////////////////////////////////
      function(goodInfo, selfInfo, orderid, profile, cb) { // пополняем баланс, себе или другому пользователю
        let options = {};
        options.from_id = selfInfo[PF.ID];
        options.from_vid = selfInfo[PF.VID];

        if(payInfo[1]) {
          db.findUser(null, payInfo[1], [PF.MONEY], function(err, info) {
            if(err) { return cb(err, null); }

            if (info) {
              getUserProfile(info[PF.ID], function (err, friendProfile) {
                if(err) { return cb(err, null); }
                
                friendProfile.setMoney(info[PF.MONEY] + goodInfo[PF.PRICE], function (err, money) {
                  if(err) { return cb(err, null); }
                  
                  let friendSocket = friendProfile.getSocket();
                  if(friendSocket) {
                    friendSocket.emit(constants.IO_GET_MONEY, { [PF.MONEY] : money })
                  }
  
                  options[PF.ID] = friendProfile.getID();
                  options[PF.VID] = friendProfile.getVID();
                  options[PF.MONEY] = goodInfo[PF.PRICE];
  
                  stat.setUserStat(selfInfo[PF.ID], selfInfo[PF.VID], constants.SFIELDS.COINS_GIVEN, options[PF.MONEY]);
  
                  let field = getField(payInfo[0], false);
                  stat.setMainStat(field, 1);
  
                  let socket = profile.getSocket();
                  if(socket) {
                    socket.emit(constants.IO_GIVE_MONEY, options);
  
                    let roomList = oPool.roomList;
                    let room = roomList[socket.id];
                    if(room) {
                      socket.broadcast.in(room.getName()).emit(constants.IO_GIVE_MONEY, options);
                    }
                  }
                  
                  let newPoints = goodInfo[PF.PRICE] * REFILL_POINTS;
                  profile.addPoints(newPoints, function (err) {
                    if(err) { return cb(err, null); }
  
                    cb(null, { orderid : orderid });
                  });
                })
              });
              
              
            } else cb(new Error("Неверно указан vid пользователя - получателя товара"), null);
          });
        } else {
          options[PF.ID]      = selfInfo[PF.ID];
          options[PF.VID]     = selfInfo[PF.VID];
          // options[PF.MONEY]   = selfInfo[PF.MONEY] + goodInfo[PF.PRICE2];
          // options[PF.POINTS]  = selfInfo[PF.POINTS] + goodInfo[PF.PRICE2] * REFILL_POINTS;

          profile.setMoney(selfInfo[PF.MONEY] + goodInfo[PF.PRICE], function (err, money) {
            if (err) { return cb(err, null); }
            
            let socket = profile.getSocket();
            if(socket) {
              socket.emit(constants.IO_GET_MONEY, { [PF.MONEY] : money });
            }
            
            let newPoints = goodInfo[PF.PRICE] * REFILL_POINTS;
            
            profile.addPoints(newPoints, function (err, points) {
              if (err) { return cb(err, null); }
  
              options[PF.MONEY] = goodInfo[PF.PRICE];
  
              if(oPool.profiles[options.id]) {
                oPool.profiles[options.id].getSocket().emit(constants.IO_GIVE_MONEY, options);
              }
  
              let field = getField(payInfo[0], true);
              stat.setMainStat(field, 1);
  
              let result = {};
              result.orderid = orderid;
              cb(null, result);
            });
            
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

      let resJSON = JSON.stringify(response);
      callback(null, resJSON);
    });
  } else {
    response["error"] = {
      "error_code": 100,
      "error_msg": "Передано непонятно что вместо chargeable.",
      "critical": true
    };

    let resJSON = JSON.stringify(response);
    callback(null, resJSON);
  }
}

//-------------------------------------
function getField (goodID, isSelf) {
  let SF = constants.SFIELDS;
  let LOTS = constants.MONEY_LOTS;
  let field;
  
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
  let response = {};
  response["error"] = {
    "error_code": 100,
    "error_msg": "Не удалось распознать запрос",
    "critical": true
  };

  let resJSON = JSON.stringify(response);
  callback(null, resJSON);
}