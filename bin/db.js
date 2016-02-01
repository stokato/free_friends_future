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

  var fields = "usr_id, usr_vid";
  var values = "?, ?";
  var params = [id, vid];
  if (user.age)       { fields = fields + ", usr_age";      values = values +  ", ?"; params.push(user.age); }
  if (user.location)  { fields = fields + ", usr_location"; values = values +  ", ?"; params.push(user.location); }
  if (user.status)    { fields = fields + ", usr_status";   values = values +  ", ?"; params.push(user.status); }
  if (user.money)     { fields = fields + ", usr_money";  values = values +  ", ?"; params.push(user.money); }
  if (user.gender)    { fields = fields + ", usr_gender";   values = values +  ", ?"; params.push(user.gender); }
  if (user.points)    { fields = fields + ", usr_points";   values = values +  ", ?"; params.push(user.points); }

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
    search = "usr_id";
    param.push(id);
  }
  else {
    search = "usr_vid";
    param.push(vid);
  }

  var fields = '';
  for(var i = 0; i < f_list.length; i++) {
    if(f_list == "usr_age")      fields += ", usr_age";
    if(f_list == "usr_location") fields += ", usr_location";
    if(f_list == "usr_status")   fields += ", usr_status";
    if(f_list == "usr_gender")   fields += ", usr_gender";
    if(f_list == "usr_points")   fields += ", usr_points";
    if(f_list == "usr_money")    fields += ", usr_money";
  }


  var query = "select usr_id, usr_vid " + fields + " FROM users where " + search +" = ?";
  
  client.execute(query,param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
      
    var user = '';
                    
    if(result.rows.length > 0) {
      user = result.rows[0];
      callback(null, {
                      id : user.usr_id,
                      age : user.usr_age,
                      location : user.usr_location,
                      gender   : user.usr_gender,
                      points   : user.usr_points,
                      status : user.usr_status,
                      money : user.usr_money,
                      vid : user.usr_vid
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
    if(f_list == "usr_age") fields += ", usr_age";
    if(f_list == "usr_location") fields += ", usr_location";
    if(f_list == "usr_status") fields += ", usr_status";
    if(f_list == "usr_gender") fields += ", usr_gender";
    if(f_list == "usr_points") fields += ", usr_points";
    if(f_list == "usr_money") fields += ", usr_money";
  }

  var query = "select usr_id" + fields + " FROM users";

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
          id : user.usr_id,
          vid    : user.usr_vid,
          age : user.usr_age,
          location : user.usr_location,
          gender   : user.usr_gender,
          status : user.usr_status,
          points   : user.usr_points,
          money  : userusr_.money
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
  var id = user.id;
  var vid = user.vid;
  
  var error = null;
  if (!id || !vid) {
    error =  new Error("Задан пустй Id пользователя");
    callback(error, null);
    return;
  }
  
  var fields = " usr_vid = ? ";
  var params = [];
  params.push(user.vid);
  if (user.age)       { fields = fields + ", usr_age = ? ";      params.push(user.age); }
  if (user.location)  { fields = fields + ", usr_location = ? "; params.push(user.location); }
  if (user.status)    { fields = fields + ", usr_status = ? ";   params.push(user.status); }
  if (user.money)     { fields = fields + ", usr_money = ? ";    params.push(user.money); }
  if (user.gender)    { fields = fields + ", usr_gender = ? ";   params.push(user.gender); }
  if (user.points)    { fields = fields + ", usr_points = ? ";   params.push(user.points); }

  var query = "update users set " + fields + " where usr_id = ?";
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
  
  var query = "DELETE FROM users WHERE usr_id = ?";
  
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
  var fromid = gift.fromid;

  if (!user) {
    return callback(new Error("Не указан Id пользователя"), null);
  }

  if (!type || !data || !date || !from) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  var id = genId(ID_LEN);

    var fields = "gft_id, gft_userid, gft_giftid, gft_type, gft_data, gft_date, gft_fromid";
    var values = "?, ?, ?, ?, ?, ?, ?";
    var params = [id, user, giftId, type, data, date, fromid];

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
  var user = uid;
  if (!user) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }

  var query = "select gft_giftid, gft_type, gft_data, gft_date, gft_fromid FROM user_gifts where gft_userid = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var gifts = [];

    if(result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        var gft = result.rows[i];
        var gift = {
          id : gft.gft_giftid,
          type : gft.gft_type,
          data : gft.gft_data,
          date : gft.gft_date,
          fromid : gft.gft_fromid
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

  var query = "select gft_id, user FROM user_gifts where gft_userid = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_gifts WHERE gft_id in ( " + fields + " )";
    client.execute(query, [params], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

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

  if (!date || !user || !companion || !text) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  var id = genId(ID_LEN);

  var fields = "mes_id, mes_userid, mes_date, mes_companionid, mes_incoming, mes_text";
  var values = "?, ?, ?, ?, ?, ?";
  var params = [id, user, date, companion, incoming, text];

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
  var user = uid || '';

  if (!user) { return callback(new Error("Задан пустой Id пользователя"), null); }

  var query = "select  mes_date,  mes_companionid,  mes_incoming,  mes_text FROM user_messages where mes_userid = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var messages = [];

    if(result.rows.length > 0) {
      for(var i = 0; i < result.rows.length; i++) {
        var msg = result.rows[i];
        var message = {
          date      : msg.mes_date,
          companion : msg.mes_companionid,
          incoming  : msg.mes_incoming,
          text      : msg.mes_text
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
  var user = uid || '';
  if (!user) { callback(new Error("Задан пустой Id пользователя")); }

  var query = "select mes_id FROM user_messages where mes_userid = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_messages WHERE mes_id in ( " + fields + " )";
    client.execute(query, [params], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

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

  var query = "select * FROM user_friends where frd_userid = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
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

    var fields = "frd_id, frd_userid, frd_friendid, frd_date";
    var values = "?, ?, ?, ?";

    var params = [id, user, fid, date];

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

  var query = "select frd_friendid, frd_friendvid, frd_date FROM user_friends where frd_userid = ?";

  client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var friends = [];
    var friend = null;

    if(result.rows.length > 0) {

      for(var i = 0; i < result.rows.length; i++) {
        friend = { id: result.rows[i].frd_friendid, vid: result.rows[i].frd_friendvid, date: result.rows[i].frd_date };
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

  var query = "select frd_id FROM user_friends where frd_userid = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_friends WHERE frd_id in ( " + fields + " )";
    client.execute(query, [params], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

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

  if ( !user || !gid || !date) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }
  var query = "select * FROM user_guests where gst_userid = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
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

    var fields = "gst_id, gst_userid, gst_guestid, gst_date";
    var values = "?, ?, ?, ?";

    var params = [id, user, gid, date];
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
  var user = uid;
  if (!user ) {
    return callback(new Error("Задан пустой Id"), null);
  }

  var query = "select gst_guestid, gst_guestvid, gst_date FROM user_guests where gst_userid = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var guests = [];
    var guest = null;

    if(result.rows.length > 0) {

      for(var i = 0; i < result.rows.length; i++) {
        guest = { id: result.rows[i].gst_guestid, vid: result.rows[i].gst_guestvid, date: result.rows[i].gst_date };
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

  var query = "select gst_id FROM user_guests where gst_user = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_guests WHERE gst_id in ( " + fields + " )";
    client.execute(query, [params], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

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
  var type    = good.type;

  if ( !goodId || !title || !price || !data || !type) {
    return callback(new Error("Не указан Id товара"), null);
  }

  var id = genId(ID_LEN);

  var fields = "shp_id, shp_title, shp_price, shp_data, shp_type";
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

  var query = "select shp_title, shp_type, shp_price, shp_data FROM shop where shp_id = ?";

  client.execute(query,[goodid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }
    var gd = result.rows[0];

    var good = {
      id   : goodid,
      title: gd.shp_title,
      type : gd.shp_type,
      price: gd.shp_price,
      data:  gd.shp_data
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
  var query = "select shp_title, shp_type, shp_price, shp_data FROM shop";

  client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var goods = [];
    for (var i = 0; i < result.rows.length; i++) {
      var gd = result.rows[i];


      goods.push({
          title: gd.shp_title,
          type : gd.shp_type,
          price: gd.shp_price,
          data:  gd.shp_data
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

  var query = "DELETE FROM shop WHERE shp_id = ?";

  client.execute(query, [results.rows[0].id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    cb(null, goodid);
  });

};
//////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = DBManager;