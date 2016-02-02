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
  var vid = user.vid;
  
  if (!vid) {
    return callback(new Error("Не заданы имя пользователя или его Id"), null);
  }

  var id = genId(ID_LEN);

  var fields = "id, vid";
  var values = "?, ?";
  var params = [id, vid];
  if (user.age)       { fields = fields + ", age";      values = values +  ", ?"; params.push(user.age); }
  if (user.location)  { fields = fields + ", location"; values = values +  ", ?"; params.push(user.location); }
  if (user.status)    { fields = fields + ", status";   values = values +  ", ?"; params.push(user.status); }
  if (user.money)     { fields = fields + ", money";  values = values +  ", ?"; params.push(user.money); }
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
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
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

  var fields = '';
  for(var i = 0; i < f_list.length; i++) {
    if(f_list[i] == "age")      fields += ", age";
    if(f_list[i] == "location") fields += ", location";
    if(f_list[i] == "status")   fields += ", status";
    if(f_list[i] == "gender")   fields += ", gender";
    if(f_list[i] == "points")   fields += ", points";
    if(f_list[i] == "money")    fields += ", money";
  }


  var query = "select id, vid " + fields + " FROM users where " + search +" = ?";
  
  client.execute(query,param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length > 0) {
      var us = result.rows[0];
      var user = {
        id : us.id,
        age : us.age,
        location : us.location,
        gender   : us.gender,
        points   : us.points,
        status : us.status,
        money : us.money,
        vid : us.vid
      };

      callback(null, user);
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
    if (err) { return callback(err, null);}

    var users = [];

    if(result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        var us = result.rows[i];
        var user = {
          id : us.id,
          vid    : us.vid,
          age : us.age,
          location : us.location,
          gender   : us.gender,
          status : us.status,
          points   : us.points,
          money  : us.money
        };
        users.push(user);
      }
    }

    callback(null, users);
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
  var id = user.id;
  var vid = user.vid;
  
  var error = null;
  if (!id || !vid) {
    return callback(new Error("Задан пустй Id пользователя"), null);
  }
  
  var fields = " vid = ? ";
  var params = [];
  params.push(user.vid);
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
  var gift = gft || {};

  var giftId = gift.id;
  var type = gift.type;
  var data = gift.data;
  var date = gift.date;
  var fromid = gift.fromid;
  var fromvid = gift.fromvid;

  if (!uid) {
    return callback(new Error("Не указан Id пользователя"), null);
  }

  if (!type || !data || !date || !fromid || !fromvid) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  var id = genId(ID_LEN);

    var fields = "id, userid, giftid, type, data, date, fromid, fromvid";
    var values = "?, ?, ?, ?, ?, ?, ?, ?";
    var params = [id, uid, giftId, type, data, date, fromid, fromvid];

    var query = "INSERT INTO user_gifts (" + fields + ") VALUES (" + values + ")";

    client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }
      callback(null, gift);
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
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }

  var query = "select giftid, type, data, date, fromid, fromvid FROM user_gifts where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var gifts = [];

    if(result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        var gft = result.rows[i];
        var gift = {
          giftidid : gft.giftid,
          type : gft.type,
          data : gft.data,
          date : gft.date,
          fromid : gft.fromid,
          fromvid : gft.fromvid
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
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }

  var query = "select id, user FROM user_gifts where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_gifts WHERE id in ( " + fields + " )";
    client.execute(query, [params], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, uid);
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
  var date = message.date;
  var companionid = message.companionid;
  var incoming  = message.incoming;
  var text      = message.text;
  var companionvid = message.companionvid;

  if (!date || !uid || !companionid || !text || !companionvid) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  var id = genId(ID_LEN);

  var fields = "id, userid, date, companionid, companionvid, incoming, text";
  var values = "?, ?, ?, ?, ?, ?, ?";
  var params = [id, uid, date, companionid, companionvid, incoming, text];

  var query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";

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
  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }

  var query = "select  date,  companionid, companionvid,  incoming,  text FROM user_messages where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var messages = [];

    if(result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        var msg = result.rows[i];
        var message = {
          date      : msg.date,
          companionid : msg.companionid,
          companionvid : msg.companionvid,
          incoming  : msg.incoming,
          text      : msg.text
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
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  var query = "select id FROM user_messages where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_messages WHERE id in ( " + fields + " )";
    client.execute(query, [params], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, uid);
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
  var fid   = friend.id;
  var date = friend.date;
  var fvid = friend.vid;

  if ( !uid || !fid || !fvid) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  var query = "select * FROM user_friends where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) {
      return callback(err, null);
    }

    var id = null;
    if (result.rows.length > 0) {
      for (var i = 0; i < result.rows.length; i++) {
        if (result.rows[i].friendid == fid) {
          id = result.rows[i].id;
        }
      }
    }
    if (!id) {
      id = genId(ID_LEN);
    }

    var fields = "id, userid, friendid, friendvid, date";
    var values = "?, ?, ?, ?, ?";

    var params = [id, uid, fid, fvid, date];

    var query = "INSERT INTO user_friends (" + fields + ") VALUES (" + values + ")";

    client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }

      callback(null, frnd);
    });
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

  var query = "select friendid, friendvid, date FROM user_friends where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var friends = [];
    var friend = null;

    if(result.rows.length > 0) {

      for(var i = 0; i < result.rows.length; i++) {
        friend = { id: result.rows[i].friendid, vid: result.rows[i].friendvid, date: result.rows[i].date };
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
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  var query = "select id FROM user_friends where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_friends WHERE id in ( " + fields + " )";
    client.execute(query, [params], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, uid);
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
  var gid   = guest.id;
  var gvid = guest.vid;
  var date = guest.date;

  if ( !uid || !gid || !date || !gvid) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }
  var query = "select * FROM user_guests where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var id = null;
    if(result.rows.length > 0) {

      for(var i = 0; i < result.rows.length; i++) {
        if (result.rows[i].guestid == gid) {
          id = result.rows[i].id;
        }
      }
    }
    if(!id) {  id = genId(ID_LEN); }

    var fields = "id, userid, guestid, guestvid, date";
    var values = "?, ?, ?, ?, ?";

    var params = [id, uid, gid, gvid, date];
    console.log(params);
    var query = "INSERT INTO user_guests (" + fields + ") VALUES (" + values + ")";

    client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }

      callback(null, guest);
    });
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
  if (!uid ) {
    return callback(new Error("Задан пустой Id"), null);
  }

  var query = "select guestid, guestvid, date FROM user_guests where userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var guests = [];
    var guest = null;

    if(result.rows.length > 0) {

      for(var i = 0; i < result.rows.length; i++) {
        guest = { id: result.rows[i].guestid, vid: result.rows[i].guestvid, date: result.rows[i].date };
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
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  var query = "select id FROM user_guests where user = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_guests WHERE id in ( " + fields + " )";
    client.execute(query, [params], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, uid);
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
  var type    = good.type;

  if ( !goodId || !title || !price || !data || !type) {
    return callback(new Error("Не указан Id товара"), null);
  }

  var id = genId(ID_LEN);

  var fields = "id, title, price, data, type";
  var values = "?, ?, ?, ?, ?";

  var params = [id, goodId, title, price, data, type];

    var query = "INSERT INTO shop (" + fields + ") VALUES (" + values + ")";

    client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }

      callback(null, good);
    });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
DBManager.prototype.findGood = function(goodid, callback) {

  if(!goodid) { return callback(new Error("Не задан ИД товара"), null); }

  var query = "select title, type, price, data FROM shop where id = ?";

  client.execute(query,[goodid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }
    var gd = result.rows[0];

    var good = {
      id   : goodid,
      title: gd.title,
      type : gd.type,
      price: gd.price,
      data:  gd.data
    };

    callback(null, good);
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
DBManager.prototype.findAllGoods = function(callback) {
  var query = "select id, title, type, price, data FROM shop";

  client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var goods = [];
    for (var i = 0; i < result.rows.length; i++) {
      var gd = result.rows[i];


      goods.push({
          giftid: gd.id,
          title: gd.title,
          type : gd.type,
          price: gd.price,
          data:  gd.data
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

  var query = "DELETE FROM shop WHERE id = ?";

  client.execute(query, [results.rows[0].id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    cb(null, goodid);
  });

};
//////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = DBManager;