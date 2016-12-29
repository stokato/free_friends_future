/**
 * Проверяем, получена ли сессия
 *
 */

const cookie = require('cookie');
const logger = require('./../../lib/log')(module);

module.exports = function(socket, next) {
  let  data = socket.request;

  //Проверяем переданы ли cookie
  if (!data.headers.cookie) {
    logger.error("Куки не переданы");
    return next(new Error("Куки не переданы"));
  }

  // Парсим cookie
  let  dataCookie = cookie.parse(data.headers.cookie);

  // Получаем идентификатор сессии
  let  sid = dataCookie['session:sid'] || "";

  if (!sid) {
    logger.error("Отсутствует ключ сессии");
    return next(new Error("Отсутствует ключ сессии"));
  }

  sid = sid.substr(2).split('.');
  sid = sid[0];
  //data.sessionID = sid;

  next();
};