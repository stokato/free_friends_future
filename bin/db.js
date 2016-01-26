var cassandra = require('cassandra-driver');
var genId = require('uid');
var async = require('async');
var Config = require('../config.json').cassandra;

var client = new cassandra.Client({contactPoints: [Config.host],
                                  keyspace: Config.keyspace});
var ID_LEN = 10;
/**
 * Класс, обеспечивающий работу с БД Кассандра
 * содержит методы - добавить пользователя (обязательные поля - ид и имя) - возвращает добавленного
 *                 - найти пользователя (ид) - возвращает найденного
 *                 - изменить пользователя (ид, имя) - возвращает ид
 *                 - удалит пользователя (ид) - возвращает ид
 */
var DBManager = function(client) {
  
};

/////////////////////////////////////////////////////////////////////////////////////////////////
// Добавить пользователя - проверки на пустое имя и ид
// Если удачно, возвращаем добавленного 
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
// Найти пользователя по внешнему ид - если нашли - возвращаем его в объекте
DBManager.prototype.findUser = function(id, vid, callback) {
  if (!vid && !id) {
    var error = new Error("Ошибка при поиске пользователя: Не задан ID или VID");
    return callback(error, null);
  }
  var field = '';
  param = [];

  if(id) {
    field = "id";
    param.push(id);
  }
  else {
    field = "vid";
    param.push(vid);
  }

  var query = "select id, vid, age, location, status, gender, points, money FROM users where " + field +" = ?";
  
  client.execute(query,param, {prepare: true }, function(err, result) {
    if (err) {
      return callback(err, null);
    }
      
    var user = '';
                    
    if(result.rows.length > 0) {
      user = result.rows[0];
      
      callback(null, {
                      id : user.id,
                      //name : user.name,
                      age : user.age,
                      //avatar : user.avatar,
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
// Получить список всех пользователей
DBManager.prototype.findAllUsers = function(callback) {

  var query = "select id, age, location, status, gender, points FROM users";

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
// Изменяем данные пользователя, если успешно, возвращаяем его pid
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
  //if (user.name)      { fields = fields + ", name = ? ";      params.push(user.name); }
  if (user.age)       { fields = fields + ", age = ? ";      params.push(user.age); }
  //if (user.avatar)    { fields = fields + ", avatar = ? ";   params.push(user.avatar); }
  if (user.location)  { fields = fields + ", location = ? "; params.push(user.location); }
  if (user.status)    { fields = fields + ", status = ? ";   params.push(user.status); }
  if (user.money)     { fields = fields + ", money = ? ";    params.push(user.money); }
  if (user.gender)    { fields = fields + ", gender = ? ";   params.push(user.gender); }
  if (user.points)    { fields = fields + ", points = ? ";   params.push(user.points); }

  var query = "update users set " + fields + " where id = ?";
  params.push(id);
  
  client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }
      
      callback(null, pid);
  });
};

////////////////////////////////////////////////////////////////////////////////////////
// Удаляем пользователя, если успешно - возвращаем его pid
DBManager.prototype.deleteUser = function(id, callback) {

  if (!id) { callback(new Error("Задан пустой Id")); }
  
  var query = "DELETE FROM users WHERE id = ?";
  
  client.execute(query, [id], {prepare: true }, function(err) {
      if (err) {  return callback(err); }
      
      callback(null, pid);
  });
};
/////////////////////////////////////////////////////////////////////////////////////////
// Добавить подарок, сначала проверяем на правильность параметры, затем - есть ли пользователь с
// таким id в базе. Добавляем подарок в таблицу user_gifts
DBManager.prototype.addGift = function(uid, gft, callback) {
  var gift = gft           || {};
  var user = uid           || '';

  var giftId   = gift.id   || '';
  var type = gift.type     || '';
  var data = gift.data     || '';
  var date = gift.date     || '';
  var from = gift.from     || '';

  if (!user) {
    return callback(new Error("Не указан Id пользователя"), null);
  }

  if (type == '' || data == '' || date == '' || from == '') {
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
// Найти все подарки пользователя и вернуть их в массиве
DBManager.prototype.findGifts = function(uid, callback) {
  var user = uid || '';
  if (user == '') {
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
DBManager.prototype.deleteGifts = function(uid, callback) {
  var user = uid || '';
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
      callback(null, pid);
    });
  });


};
///////////////////////////////////////////////////////////////////////////////////////////////////////
// Сохранить в истории сообщение пользователя
DBManager.prototype.addMessage = function(uid, msg, callback) {
  var message = msg                 || {};
  var user = uid;
  var date = message.date;
  var companion = message.companion;
  var incoming  = message.incoming;
  var text      = message.text;
  var gift      = message.gift;

  if (!date || !user || !companion || !text || !gift || !incoming) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  var query = "select id FROM users where id = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if (!result.rows.length > 0) {
      return callback(new Error("В базе данных нет пользователя с таким именем"));
    }

    var id = genId(ID_LEN);

    var fields = "id, user, date, companion, incoming, text";
    var values = "?, ?, ?, ?, ?, ?";
    var params = [id, user, date, companion, incoming, text];

    if(gift) { fields = fields + ", gift"; values = values + ", ?"; params.push(gift); }

    var query = "INSERT INTO history (" + fields + ") VALUES (" + values + ")";

    client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }

      callback(null, message);
    });
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
// Найти сохраненные сообщения пользователя
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
// Удалить все сообщения пользователя
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

            cb(null, pid);
          });
        },
        function(err, res) {
          if (err) {
            return callback(err, null);
          }
          callback(null, pid);
        });
  });

};
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Сохранить в пльзователя в списке друзей
DBManager.prototype.addFriend = function(uid, frnd, callback) {
  var friend = frnd || {};
  var user = uid;
  var fid   = friend.id;
  var date = friend.date;

  if ( !user || !fid) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  var query = "select id FROM users where id = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    if (!result.rows.length > 0) {
      return callback(new Error("В базе данных нет пользователя с таким именем"));
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
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
// Найти друзей пользователя
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
// Удалить все сообщения пользователя
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

            cb(null, pid);
          });
        },
        function(err, res) {
          if (err) {
            return callback(err, null);
          }
          callback(null, pid);
        });
  });

};


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Сохранить в гостя в списке гостей
DBManager.prototype.addGuest = function(uid, gst, callback) {
  var guest = gst || {};
  var user = uid;
  var gid   = guest.id;
  var date = guest.date;

  if ( !user || !gid) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  var query = "select id FROM users where id = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    if (!result.rows.length > 0) {
      return callback(new Error("В базе данных нет пользователя с таким именем"));
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
  });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
// Найти друзей пользователя
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
// Удалить все сообщения пользователя
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

            cb(null, pid);
          });
        },
        function(err, res) {
          if (err) {
            return callback(err, null);
          }
          callback(null, pid);
        });
  });

};
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Добавить товар в магазин
DBManager.prototype.addGood = function(gd, callback) {
  var good    = gd || {};

  var goodId  = good.id;
  var title   = good.title;
  var price   = good.price;
  var data    = good.data;

  if ( !goodId) {
    return callback(new Error("Не указан Id товара"), null);
  }

  var id = genId(ID_LEN);

  var fields = "id, goodid, title, price, data";
  var values = "?, ?, ?, ?, ?";

  var params = [id, goodId, title, price, data];

    var query = "INSERT INTO shop (" + fields + ") VALUES (" + values + ")";

    client.execute(query, params, {prepare: true },  function(err) {
      if (err) {  return callback(err); }

      callback(null, frnd);
    });
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
// Найти товар
DBManager.prototype.findGood = function(goodid, callback) {
  if (!goodid) {
    return callback(new Error("Задан пустой Id товара"), null);
  }

  var query = "select title, price, date FROM shop where goodId = ?";

  client.execute(query,[user], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var good = null;

    if(result.rows.length > 0) {

      good = {
        title: result.rows[0].title,
        price: price.rows[0].price,
        date:  date.rows[0].date
      };

      callback(null, good);

    } else { return callback(null, null); }
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Удалить все сообщения пользователя
DBManager.prototype.deleteGood = function(goodid, callback) {
  var id = goodid;
  if (!id) { callback(new Error("Задан пустой Id товара")); }

  var query = "select id FROM shop where goodid = ?";

  client.execute(query,[id], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(!results.rows[0]) { return callback(new Error("Нет товара с таким Id"));}

    var query = "DELETE FROM guests WHERE id = ?";

    client.execute(query, [results.rows[0].id], {prepare: true }, function(err) {
      if (err) {  return callback(err); }

        cb(null, goodid);
      });
  });

};
//////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = DBManager;