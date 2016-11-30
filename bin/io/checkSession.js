/**
 * Проверяем, получена ли сессия
 *
 */
var cookie = require('cookie');

var log = require('./../../lib/log')(module);

module.exports = function(socket, next) {
  var data = socket.request;

  //Проверяем переданы ли cookie
  if (!data.headers.cookie) {
    log.error("Куки не переданы");
    return next(new Error("Куки не переданы"));
  }

  // Парсим cookie
  var dataCookie = cookie.parse(data.headers.cookie);

  // Получаем идентификатор сессии
  var sid = dataCookie['session:sid'] || "";

  if (!sid) {
    log.error("Отсутствует ключ сессии");
    return next(new Error("Отсутствует ключ сессии"));
  }

  sid = sid.substr(2).split('.');
  sid = sid[0];
  //data.sessionID = sid;

  next();
};