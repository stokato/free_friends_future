var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Изменяем данные пользователя: объек с данными
 - Проверка: поле ИД обязательные
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options = options || {};
  var f = C.IO.FIELDS;

  if (!options[f.id] || !options[f.vid]) {
    return callback(new Error("Задан пустй Id пользователя"), null);
  }

  var fields = [f.vid];
  var params = [];
  params.push(options[f.vid]);
  if (f.age in options)           { fields.push(f.age);           params.push(options[f.age]); }
  if (f.country in options)       { fields.push(f.country);       params.push(options[f.country]); }
  if (f.city in options)          { fields.push(f.city);          params.push(options[f.city]); }
  if (f.status in options)        { fields.push(f.status);        params.push(options[f.status]); }
  if (f.money in options)         { fields.push(f.money);         params.push(options[f.money]); }
  if (f.sex in options)           { fields.push(f.sex);           params.push(options[f.sex]); }
  if (f.points in options)        { fields.push(f.points);        params.push(options[f.points]); }
  if (f.is_in_menu in options)    { fields.push(f.is_in_menu);    params.push(options[f.is_in_menu]); }
  if (f.newfriends in options)    { fields.push(f.newfriends);    params.push(options[f.newfriends]); }
  if (f.newgifts in options)      { fields.push(f.newgifts);      params.push(options[f.newgifts]); }
  if (f.newguests in options)     { fields.push(f.newguests);     params.push(options[f.newguests]); }
  if (f.newmessages in options)   { fields.push(f.newmessages);   params.push(options[f.newmessages]); }

  var query = qBuilder.build(qBuilder.Q_UPDATE, fields, C.T_USERS, [f.id], [1]);

  params.push(options[f.id]);

  this.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};