/**
 * Модуль обработки запросов от Вконтакте
 */

const async = require('async');
const md5   = require('md5');

const Config        = require('./../config.json');
const PF            = require('./const_fields');
const db            = require('./db_manager');
const oPool         = require('./objects_pool');
const stat          = require('./stat_manager');

const sanitize      = require('./sanitize');
const getUserProfile = require('./io/lib/common/get_user_profile');

function VK () {}

VK.prototype.handle = function(req, callback) {
  
  let request = req || {};

  // Сначала проверка
  let sig = request["sig"];

  let fields= [];
  for(let key in request) /* if(request.hasOwnProperty(key)) */{
    if(key === "sig") {
      continue;
    }

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
  db.findCoins(goodId, function (err, goodInfo) {
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
        "price"     : goodInfo[PF.PRICE_VK]
      };
    }

    let resJSON = JSON.stringify(response);
    callback(null, resJSON);
  });
}

function changeOrderStatus(request, callback) {
  
  const REFILL_POINTS = Number(Config.points.refill);
  const MONEY_TYPE    = Config.good_types.money;
  const COINS         = Config.moneys.money_lots;
  const IO_GIVE_MONEY = Config.io.emits.IO_GIVE_MONEY;
  
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
        db.findCoins(options[PF.GOODID], (err, goodInfo) => {
          if (err) {
            return cb(err, null);
          }

          if (goodInfo) {
            if(goodInfo[PF.PRICE_VK] != options[PF.PRICE])
              cb(new Error("Неверно указана цена товара"), null);
            else
              cb(null, goodInfo);
          } else cb(new Error("Нет такого подарка"), null);
        });
      },/////////////////////////////////////////////////////////////////
      function(goodInfo, cb) { // Ищем пользователя в базе
        db.findUser(null, options[PF.VID], [PF.MONEY, PF.POINTS], (err, info) => {
          if(err) {
            return cb(err, null);
          }

          if (info) {
            getUserProfile(info[PF.ID], (err, profile) => {
              if(err) {
                return cb(err, null);
              }
  
              cb(null, goodInfo, info, profile);
            });
          } else cb(new Error("Нет такого пользователя"), null);
        });
      },/////////////////////////////////////////////////////////////////////
      function(goodInfo, info, profile, cb) { // Сохраняем заказ и возвращаем внутренний ид заказа

        let newMoney = info[PF.MONEY] - goodInfo[PF.PRICE];
        if(newMoney < 0 && goodInfo[PF.GOODTYPE] != MONEY_TYPE) {
          return cb(new Error("Недостаточно средств на счете"), null);
        }

        let ordOptions = {
          [PF.ORDERVID] : options[PF.ORDERVID],
          [PF.GOODID]   : goodInfo[PF.ID],
          [PF.ID]       : info[PF.ID],
          [PF.VID]      : info[PF.VID],
          [PF.SUM]      : goodInfo[PF.PRICE_VK],
          [PF.DATE]     : new Date()
        };

        db.addOrder(ordOptions, (err, orderid) => {
          if (err) {
            return cb(err, null);
          }

          cb(null, goodInfo, info, orderid, profile);
        });
      }, ///////////////////////////////////////////////////////////////////////////////
      function(goodInfo, selfInfo, orderid, profile, cb) { // пополняем баланс, себе или другому пользователю
        let options = {};
        options.from_id = selfInfo[PF.ID];
        options.from_vid = selfInfo[PF.VID];

        if(payInfo[1]) {
          db.findUser(null, payInfo[1], [PF.MONEY], (err, info) => {
            if(err) {
              return cb(err, null);
            }

            if (info) {
              getUserProfile(info[PF.ID], (err, friendProfile) => {
                if(err) {
                  return cb(err, null);
                }
                
                friendProfile.setMoney(info[PF.MONEY] + goodInfo[PF.PRICE], (err, money) => {
                  if(err) {
                    return cb(err, null);
                  }
                  
                  let friendSocket = friendProfile.getSocket();
                  if(friendSocket) {
                    friendSocket.emit(Config.io.emits.IO_GET_MONEY, { [PF.MONEY] : money })
                  }
  
                  options[PF.ID] = friendProfile.getID();
                  options[PF.VID] = friendProfile.getVID();
                  options[PF.MONEY] = goodInfo[PF.PRICE];
  
                  stat.setUserStat(selfInfo[PF.ID], selfInfo[PF.VID], PF.COINS_GIVEN, options[PF.MONEY]);
                  
                  if(COINS[payInfo[0]]) {
                    stat.setMainStat(COINS[payInfo[0]].stat_give, 1);
                  }
                  
  
                  let socket = profile.getSocket();
                  if(socket) {
                    socket.emit(IO_GIVE_MONEY, options);
  
                    let roomList = oPool.roomList;
                    let room = roomList[socket.id];
                    if(room) {
                      socket.broadcast.in(room.getName()).emit(IO_GIVE_MONEY, options);
                    }
                  }
                  
                  let newPoints = goodInfo[PF.PRICE] * REFILL_POINTS;
                  profile.addPoints(newPoints, (err) => {
                    if(err) {
                      return cb(err, null);
                    }
  
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

          profile.setMoney(selfInfo[PF.MONEY] + goodInfo[PF.PRICE], (err, money) => {
            if (err) {
              return cb(err, null);
            }
            
            let socket = profile.getSocket();
            if(socket) {
              socket.emit(Config.io.emits.IO_GET_MONEY, { [PF.MONEY] : money });
            }
            
            let newPoints = goodInfo[PF.PRICE] * REFILL_POINTS;
            
            profile.addPoints(newPoints, function (err, points) {
              if (err) {
                return cb(err, null);
              }
  
              options[PF.MONEY] = goodInfo[PF.PRICE];
  
              if(oPool.profiles[options.id]) {
                oPool.profiles[options.id].getSocket().emit(IO_GIVE_MONEY, options);
              }
  
              if(COINS[payInfo[0]]) {
                stat.setMainStat(COINS[payInfo[0]].stat_take, 1);
              }
  
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