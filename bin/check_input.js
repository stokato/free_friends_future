/**
 * Проверяем поля объектов, полученных от клиента, на соответствие требованиям
 *
 * @param em - эмит, socket, options - объект с опциями для проверки, callback
 * @return socket, options - проверенные и санитаризированные опции
 */

const Config = require('./../config.json');
const oPool     = require('./objects_pool');

module.exports = function (em, socket, options, callback) {
  
  // Попытка повторного подключения
  if(em == Config.io.emits.IO_INIT && oPool.userList[socket.id] ) {
    return callback(Config.errors.NO_AUTH);
  }
  
  // Такого пользователя нет
  if(em != Config.io.emits.IO_INIT && !oPool.userList[socket.id] ) {
    return callback(Config.errors.NO_AUTH);
  }
  
  // Не переданы опции
  if(!checkOptionsType(options)) {
    return callback(Config.errors.NO_PARAMS);
  }
  
  // Проверка подписи
  /*
  if(!checkAuth(em, socket, options)) {
        return callback(cFields.errors.NO_AUTH);
   }
  */
  
  callback(null, socket, options);
};

//--------------------------------------
function checkOptionsType(options) {
  if (!options) { return false; } else
  if (typeof options != "object") { return false }
  
  return true;
}

