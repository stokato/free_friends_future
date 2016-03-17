var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Изменить сообщение в БД: Свойства сообщения
 - Проверка (ИД обязателен)
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  var self = this;
  var m = C.IO.FIELDS;

  if (!options[m.id] || !uid || !options[m.companionid]) {
    return callback(new Error("Задан пустй Id пользователя, его собеседника или сообщения"), null);
  }

  var constraints = [m.userid, m.companionid, m.id];
  var query = qBuilder.build(qBuilder.Q_SELECT, [m.id], C.T_USERMESSAGES, constraints, [1,1,1]);

  var params = [uid, options[m.companionid], options[m.id]];

  self.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(new Error("Сообщения с таким Id нет в базе данных"), null)}

    var fields = [];
    if (options[m.date])     { fields.push(m.date);      params.push(options[m.date]); }
    if (options[m.companionvid]) { fields.push(m.companionvid);  params.push(options[m.companionvid]); }
    if (options[m.incoming]) { fields.push(m.incoming);  params.push(options[m.incoming]); }
    if (options[m.text])     { fields.push(m.text);      params.push(options[m.text]); }
    if (options[m.opened]) { fields.push(m.opened);  params.push(options[m.opened]); }

    var constraints = [m.userid, m.companionid, i.id];
    var query = qBuilder.build(qBuilder.Q_UPDATE, fields, C.T_USERMESSAGES, constraints, [1,1,1]);

    self.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, options);
    });
  });
};