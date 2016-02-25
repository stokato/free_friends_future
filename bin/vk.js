
//var secret_key = "hiUl8U4F9q3BcbAl28va"; // Защищенный ключ приложения
function VK (handler) {
  this.handler = handler;
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

      this.handler.getGood(goodId, function(err, goodInfo) {
        if(err) {
          response["error"] = {
            "error_code" : err.code,
            "error_msg"  : err.message,
            "critical"   : true
          };

        } else {
          response["response"] = {
            "item_id" : goodInfo.goodid,
            "title"   : goodInfo.title,
            "photo_url" : goodInfo.data,
            "price"   : goodInfo.price
          };
        }
      });
      break;

    case "get_item_test":
      // Получение информации о товаре в тестовом режиме
      item = input["item"];
      var goodId = request["item"];
      this.handler.getGoodTest(goodId, function(err, goodInfo) {
        if(err) {
          response["error"] = {
            "error_code" : err.code,
            "error_msg"  : err.message,
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

        this.handler.issueGood(options, function (err, goodInfo) {
          if (err) {
            response["error"] = {
              "error_code": err.code,
              "error_msg": err.message,
              "critical": true
            };
          } else {
            response["response"] = {
              "order_id": orderId,
              "app_order_id": goodInfo.orderId
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

        this.handler.issueGoodTest(options, function (err, goodInfo) {
          if (err) {
            response["error"] = {
              "error_code": err.code,
              "error_msg": err.message,
              "critical": true
            };
          } else {
            response["response"] = {
              "order_id": orderId,
              "app_order_id": goodInfo.orderId
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
