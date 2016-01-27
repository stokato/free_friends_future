var cassandra = require('cassandra-driver');
var genId = require('uid');
var async = require('async');
var Config = require('../config.json').cassandra; // Настойки доступа к БД
                                                  // Клиент Кассанда
var client = new cassandra.Client({contactPoints: [Config.host],
                                  keyspace: Config.keyspace});
var ID_LEN = 10;                                  // Длина ИД (ключевое поле)
/**
 * Класс, обеспечивающий работу с БД Кассандра
 * содержит методы - добавить пользователя (обязательные поля - ид и имя) - возвращает добавленного
 *                 - найти пользователя (ид) - возвращает найденного
 *                 - изменить пользователя (ид, имя) - возвращает ид
 *                 - удалить пользователя (ид) - возвращает ид
 *                 - добавить, найти, удалить подарки
 *                 - добавить, найти, удалить историю сообщений
 *                 - добавить, найти, найти одного, удалить друзей
 *                 - добавить, найти, удалить гостей
 *                 - добавить, найти, удалить товар (магазин)
 */
var DBManager = function(client) {
  
};

/////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Добавляем пользователя в БД: объект с данными пользователя из соц. сетей
 - Проверка (ВИД обязателен)
 - Генерируем внутренний ИД
 - Строим запрос
 - Выполняем запрос
 - Возвращаем объект обратно
  */
DBManager.prototype.addUser = function(usr, callback) {
  var user = usr || {};
  var vid = user.vid || '';

  var error = null;
  
  if (vid == '') {
    error = new Error("Не заданы имя пользователя или его Id");
    return callback(error, null);
  }

  var id = genId(ID_LEN);

  var fields = "id, vid";
  var values = "?, ?";
  var params = [id, vid];
  if (user.age)       { fields = fields + ", age";      values = values +  ", ?"; params.push(user.age); }
  //if (user.avatar)    { fields = fields + ", avatar";   values = values +  ", ?"; params.push(user.avatar); }
  if (user.location)  { fields = fields + ", location"; values = values +  ", ?"; params.push(user.location); }
  if (user.status)    { fields = fields + ", status";   values = values +  ", ?"; params.push(user.status); }
  if (user.money)   { fields = fields + ", money";  values = values +  ", ?"; params.push(user.money); }
  //if (user.name)     { fields = fields + ", name";    values = values +  ", ?"; params.push(user.name); }
  if (user.gender)    { fields = fields + ", gender";   values = values +  ", ?"; params.push(user.gender); }
  if (user.points)    { fields = fields + ", points";   values = values +  ", ?"; params.push(user.points); }

  var query = "INSERT INTO users (" + fields + ") VALUES (" + values + ")";
  
  client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }
      user.id = id;
      callback(null, user);
    });
};

//////////////////////////////////////////////////////////////////////////////////////////////
/*
 Найти пользователя(по внутреннему или внешнему ИД): ИД, ВИД, списко искомых полей
 - Проверка
 - Определяем - по чему будем искать
 - Строим запрос
 - Обращаемся к БД и обрабатываем рузультат
 - Возвращаем объект с данными игрока (если нет такого - NULL)
 */
DBManager.prototype.findUser = function(id, vid, f_list, callback) {
  if (!vid && !id) {
    var error = new Error("Ошибка при поиске пользователя: Не задан ID или VID");
    return callback(error, null);
  }
  var search = '';
  var param = [];

  if(id) {
    search = "id";
    param.push(id);
  }
  else {
    search = "vid";
    param.push(vid);
  }

  var fields = [];
  for(var i = 0; i < f_list.length; i++) {
    if(f_list == "age")      fields += ", age";
    if(f_list == "location") fields += ", location";
    if(f_list == "status")   fields += ", status";
    if(f_list == "gender")   fields += ", gender";
    if(f_list == "points")   fields += ", points";
    if(f_list == "money")    fields += ", money";
  }


  var query = "select id, vid " + fields + " FROM users where " + search +" = ?";
  
  client.execute(query,param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
      
    var user = '';
                    
    if(result.rows.length > 0) {
      user = result.rows[0];
      callback(null, {
                      id : user.id,
                      age : user.age,
                      location : user.location,
                      gender   : user.gender,
                      points   : user.points,
                      status : user.status,
                      money : user.money,
                      vid : user.vid
                    });
    } else {
      callback(null, null);
    }
  }); 
};

///////////////////////////////////////////////////////////////////////////////////////////
/*
Получаем список всех пользователей: список искомых полей
- Строим и выполняем запрос
- Создаем массив и заполняем его данными
- Возвращяем массив (если никого нет - NULL)
 */
DBManager.prototype.findAllUsers = function(f_list, callback) {

  var fields = [];
  for(var i = 0; i < f_list.length; i++) {
    if(f_list == "age") fields += ", age";
    if(f_list == "location") fields += ", location";
    if(f_list == "status") fields += ", status";
    if(f_list == "gender") fields += ", gender";
    if(f_list == "points") fields += ", points";
    if(f_list == "money") fields += ", money";
  }

  var query = "select id" + fields + " FROM users";

  client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) {
      return callback(err, null);
    }

    var users = [];
    var user = '';

    if(result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        user = result.rows[i];
        users.push({
          id : user.id,
          vid    : user.vid,
         // name : user.name,
          age : user.age,
          location : user.location,
          gender   : user.gender,
         // avatar : user.avatar,
          status : user.status,
          points   : user.points,
          money  : user.money
        });
      }

      callback(null, users);
    } else {
      callback(null, null);
    }
  });
};

//////////////////////////////////////////////////////////////////////////////////////////
/*
Изменяем данные пользователя: объек с данными
- Проверка: поле ИД обязательные
- Строим и выполняем запрос
- Возвращаем объект обратно
 */
DBManager.prototype.updateUser = function(usr, callback) {
  var user = usr || {};
  var id = user.id || '';
  
  var error = null;
  if (id == '') {
    error =  new Error("Задан пустй Id пользователя");
    callback(error, null);
    return;
  }
  
  var fields = "";
  var params = [];
  if (user.vid)       { fields = fields + ", vid = ? ";      params.push(user.vid); }
  if (user.age)       { fields = fields + ", age = ? ";      params.push(user.age); }
  if (user.location)  { fields = fields + ", location = ? "; params.push(user.location); }
  if (user.status)    { fields = fields + ", status = ? ";   params.push(user.status); }
  if (user.money)     { fields = fields + ", money = ? ";    params.push(user.money); }
  if (user.gender)    { fields = fields + ", gender = ? ";   params.push(user.gender); }
  if (user.points)    { fields = fields + ", points = ? ";   params.push(user.points); }

  var query = "update users set " + fields + " where id = ?";
  params.push(id);
  
  client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }
      
      callback(null, user);
  });
};

////////////////////////////////////////////////////////////////////////////////////////
/*
 Удаляем пользователя: ИД
 - Проверка на ИД
 - Возвращаем ИД
 */
DBManager.prototype.deleteUser = function(id, callback) {

  if (!id) { callback(new Error("Задан пустой Id")); }
  
  var query = "DELETE FROM users WHERE id = ?";
  
  client.execute(query, [id], {prepare: true }, function(err) {
      if (err) {  return callback(err); }
      
      callback(null, id);
  });
};
/////////////////////////////////////////////////////////////////////////////////////////
/*
Добавить подарок: ИД игрока и объект с данными о подарке
- Провека: все поля
- Генерируем ИД подарка
- Строим и выполняем запрос
- Возвращаем объект подарка
 */
DBManager.prototype.addGift = function(uid, gft, callback) {
  var gift = gft           || {};
  var user = uid;

  var giftId = gift.id;
  var type = gift.type;
  var data = gift.data;
  var date = gift.date;
  var from = gift.from;

  if (!user) {
    return callback(new Error("Не указан Id пользователя"), null);
  }

  if (!type || !data || !date || !from) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  var id = genId(ID_LEN);

  var query = "select id FROM users where id = ?";
  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null);  }

    if (!result.rows.length > 0) {
      return callback(new Error("В базе данных нет пользователя с таким Id"));
    }

    var fields = "id, user, giftid, type, data, date, from";
    var values = "?, ?, ?, ?, ?, ?, ?";
    var params = [id, user, giftId, type, data, date, from];

    var query = "INSERT INTO user_gifts (" + fields + ") VALUES (" + values + ")";

    client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }
      callback(null, gift);
    });
  });
};

///////////////////////////////////////////////////////////////////////////////////////////////
/*
Найти все подарки игрока: ИД игрока
- Проверка на ИД
- Строим и выполняем запрос (все поля)
- Возвращаем массив с подарками (если ничего нет NULL)
 */
DBManager.prototype.findGifts = function(uid, callback) {
  var user = uid;
  if (!user) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }

  var query = "select giftid, type, data, date, from FROM user_gifts where user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var gifts = [];

    if(result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        var gft = result.rows[i];
        var gift = {
          id : gft.giftid,
          type : gft.type,
          data : gft.data,
          date : gft.date,
          from : gft.from
        };
        gifts.push(gift);
      }

      callback(null, gifts);

    } else {
      callback(null, null);
    }
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Удалить все подарки игрока: ИД
- Проверка на ИД
- Строим и выполняем запрос на поиск всех подарков игрока (нужны их ИД для удаления)
- По каждому найденному подарку выполняем запрос на его удаления (параллельно)
- Возвращаем ИД игрока
 */
DBManager.prototype.deleteGifts = function(uid, callback) {
  var user = uid;
  if (!user) { return callback(new Error("Задан пустой Id пользователя")); }

  var query = "select id, user FROM user_gifts where user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    async.map(result.rows, function(item, cb) {
        var query = "DELETE FROM user_gifts WHERE id = ?";
        client.execute(query, [item.id], {prepare: true }, function(err) {
          if (err) {  return cb(err); }
          cb(null, null);
        });
    },
    function(err, res) {
      if (err) {
        return callback(err, null);
      }
      callback(null, user);
    });
  });


};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Добавить сообщение в БД: ИД, объект сообщения
- Проверка (все поля обязательны)
- Генерируем ИД
- Строим и выполняем запрос
- Возвращаем объект сообщения
 */
DBManager.prototype.addMessage = function(uid, msg, callback) {
  var message = msg                 || {};
  var user = uid;
  var date = message.date;
  var companion = message.companion;
  var incoming  = message.incoming;
  var text      = message.text;

  if (!date || !user || !companion || !text || !incoming) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  var id = genId(ID_LEN);

  var fields = "id, user, date, companion, incoming, text";
  var values = "?, ?, ?, ?, ?, ?";
  var params = [id, user, date, companion, incoming, text];

  var query = "INSERT INTO history (" + fields + ") VALUES (" + values + ")";

  client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, message);
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Найти сохраненные сообщения пользователя: ИД игрока
- Проверка ИД
- Строим запрос (все поля) и выполняем
- Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
DBManager.prototype.findMessages = function(uid, callback) {
  var user = uid || '';

  if (!user) { return callback(new Error("Задан пустой Id пользователя"), null); }

  var query = "select date, companion, incoming, text, gift FROM history where user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var messages = [];

    if(result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        var msg = result.rows[i];
        var message = {
          date      : msg.date,
          companion : msg.companion,
          incoming  : msg.incoming,
          text      : msg.text,
          gift      : msg.gift
        };
        messages.push(message);
      }

      callback(null, messages);

    } else {
      callback(null, null);
    }
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Удалить все сообщения игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех сообщений игрока (нужны их ИД для удаления)
 - По каждому найденному выполняем запрос на его удаления (параллельно)
 - Возвращаем ИД игрока
 */
DBManager.prototype.deleteMessages = function(uid, callback) {
  var user = pid || '';
  if (!user) { callback(new Error("Задан пустой Id пользователя")); }

  var query = "select id FROM history where user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    async.map(result.rows, function(item, cb) {
          var query = "DELETE FROM history WHERE id = ?";

          client.execute(query, [item.id], {prepare: true }, function(err) {
            if (err) {  return callback(err); }

            cb(null, user);
          });
        },
        function(err, res) {
          if (err) {
            return callback(err, null);
          }
          callback(null, user);
        });
  });

};
//////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Добавить друга в БД: ИД, объект с данными друга
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
DBManager.prototype.addFriend = function(uid, frnd, callback) {
  var friend = frnd || {};
  var user = uid;
  var fid   = friend.id;
  var date = friend.date;

  if ( !user || !fid) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  var id = genId(ID_LEN);

  var fields = "id, user, friend, date";
  var values = "?, ?, ?, ?";

  var params = [id, user, fid, date];

  var query = "INSERT INTO friends (" + fields + ") VALUES (" + values + ")";

  client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, frnd);
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Найти друзей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными друзей (если ничгео нет - NULL)
 */
DBManager.prototype.findFriends = function(uid, callback) {
  if (!uid) {
    return callback(new Error("Задан пустой Id"), null);
  }

  var query = "select friend, date FROM friends where user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var friends = [];
    var friend = null;

    if(result.rows.length > 0) {

      for(var i = 0; i < result.rows.length; i++) {
        friend = { id: result.rows[i].friend, date: result.rows[i].date };
        friends.push(friend);
      }

      callback(null, friends);

    } else { return callback(null, null); }
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Удалить всех друзей игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех друзей игрока (нужны их ИД для удаления)
 - По каждому найденному выполняем запрос на его удаление (параллельно)
 - Возвращаем ИД игрока
 */
DBManager.prototype.deleteFriends = function(uid, callback) {
  var user = uid;
  if (!user) { callback(new Error("Задан пустой Id пользователя")); }

  var query = "select id FROM friends where user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    async.map(result.rows, function(item, cb) {
          var query = "DELETE FROM friends WHERE id = ?";

          client.execute(query, [item.id], {prepare: true }, function(err) {
            if (err) {  return callback(err); }

            cb(null, user);
          });
        },
        function(err, res) {
          if (err) {
            return callback(err, null);
          }
          callback(null, user);
        });
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Добавить гостя в БД: ИД, объект с данными гостя
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
DBManager.prototype.addGuest = function(uid, gst, callback) {
  var guest = gst || {};
  var user = uid;
  var gid   = guest.id;
  var date = guest.date;

  if ( !user || !gid) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  var id = genId(ID_LEN);

  var fields = "id, user, guest, date";
  var values = "?, ?, ?, ?";

  var params = [id, user, gid, date];

  var query = "INSERT INTO guests (" + fields + ") VALUES (" + values + ")";

  client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, frnd);
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Найти гостей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными (Если не нашли ничего - NULL)
 */
DBManager.prototype.findGuests = function(uid, callback) {
  var user = uid;
  if (user == '') {
    return callback(new Error("Задан пустой Id"), null);
  }

  var query = "select friend, date FROM guests where user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var guests = [];
    var guest = null;

    if(result.rows.length > 0) {

      for(var i = 0; i < result.rows.length; i++) {
        guest = { id: result.rows[i].guest, date: result.rows[i].date };
        guests.push(guest);
      }

      callback(null, guests);

    } else { return callback(null, null); }
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Удалить всех гостей игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех гостей игрока (нужны их ИД для удаления)
 - По каждому найденному выполняем запрос на его удаление (параллельно)
 - Возвращаем ИД игрока
 */
DBManager.prototype.deleteGuests = function(uid, callback) {
  var user = uid;
  if (!user) { callback(new Error("Задан пустой Id пользователя")); }

  var query = "select id FROM guests where user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    async.map(result.rows, function(item, cb) {
          var query = "DELETE FROM guests WHERE id = ?";

          client.execute(query, [item.id], {prepare: true }, function(err) {
            if (err) {  return callback(err); }

            cb(null, user);
          });
        },
        function(err, res) {
          if (err) {
            return callback(err, null);
          }
          callback(null, user);
        });
  });

};
//////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
DBManager.prototype.addGood = function(gd, callback) {
  var good    = gd || {};

  var goodId  = good.id;
  var title   = good.title;
  var price   = good.price;
  var data    = good.data;

  if ( !goodId || !title || !price || !data) {
    return callback(new Error("Не указан Id товара"), null);
  }

  var id = genId(ID_LEN);

  var fields = "id, goodid, title, price, data";
  var values = "?, ?, ?, ?, ?";

  var params = [id, goodId, title, price, data];

    var query = "INSERT INTO shop (" + fields + ") VALUES (" + values + ")";

    client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }

      callback(null, good);
    });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Найти товар: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем объект с данными (Если не нашли ничего - NULL)
 */
DBManager.prototype.findGood = function(goodid, callback) {
  if (!goodid) {
    return callback(new Error("Задан пустой Id товара"), null);
  }

  var query = "select id, title, price, date FROM shop where goodId = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var good = null;

    if(result.rows.length > 0) {

      good = {
        id   : result.rows[0].id,
        title: result.rows[0].title,
        price: result.rows[0].price,
        type : result.rows[0].type,
        date:  result.rows[0].date
      };

      callback(null, good);

    } else { return callback(null, null); }
  });
};
/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
DBManager.prototype.findAllGoods = function(callback) {
  var query = "select title, type, price, date FROM shop";

  client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var goods = [];
    for (var i = 0; i < result.rows.length; i++) {
      var gd = result.rows[i];


      goods.push({
          title: gd.title,
          type : gd.type,
          price: gd.price,
          date:  gd.date
        });
    }
    callback(null, goods);
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
DBManager.prototype.deleteGood = function(goodid, callback) {
  var id = goodid;
  if (!id) { callback(new Error("Задан пустой Id товара")); }

  var query = "DELETE FROM guests WHERE id = ?";

  client.execute(query, [results.rows[0].id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    cb(null, goodid);
  });

};
//////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = DBManager;