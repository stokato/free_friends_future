var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
/*
 Найти пользователя(по внутреннему или внешнему ИД): ИД, ВИД, список искомых полей
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
  //var f = C.IO.FIELDS;

  var constraint = '';
  var param = [];

  if(id) {
    constraint = "id";
    param.push(id);
  } else {
    constraint = "vid";
    param.push(vid);
  }

  var i, fields = ["id", "vid"];
  for(i = 0; i < f_list.length; i++) {
    fields.push(f_list[i]);
  }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, [constraint], [1]);

  cdb.client.execute(query,param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length > 0) {

      var user = result.rows[0];
      user.id = user.id.toString();
      user.gift1 = (user.gift1)? user.gift1.toString() : null;

      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
