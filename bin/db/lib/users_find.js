var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти пользователя(по внутреннему или внешнему ИД): ИД, ВИД, списко искомых полей
 - Проверка
 - Определяем - по чему будем искать
 - Строим запрос
 - Обращаемся к БД и обрабатываем рузультат
 - Возвращаем объект с данными игрока (если нет такого - NULL)
 */
module.exports = function(id, vid, f_list, callback) {
  if (!vid && !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
  }
  var f = C.IO.FIELDS;

  var constraint = '';
  var param = [];

  if(id) {
    constraint = f.id;
    param.push(id);
  } else {
    constraint = f.vid;
    param.push(vid);
  }

  var i, fields = [f.id, f.vid];
  for(i = 0; i < f_list.length; i++) {
    fields.push(f_list[i]);
  }

  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERS, [constraint], [1]);

  this.client.execute(query,param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length > 0) {
      var row = result.rows[0];

      var user = {};
      user[f.id]    = row[f.id].toString();
      user[f.vid]   = row[f.vid];
      user[f.age]     = row[f.age];
      user[f.country] = row[f.country];
      user[f.city]    = row[f.city];
      user[f.sex]     = row[f.sex];
      user[f.points]  = row[f.points];
      user[f.status]  = row[f.status];
      user[f.money]   = row[f.money];
      user[f.newfriends] = row[f.newfriends];
      user[f.newguests] = row[f.newguests];
      user[f.newgifts] = row[f.newgifts];
      user[f.newmessages] = row[f.newmessages];

      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
