/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 *
 * Помечаем друзей/гостей/подарки как просмотренными (убираем признак is_new)
 *
 * @param socket, options - объект с флагом, указывающим что помечать, callback
 */
var constants =  require('./../../../constants'),
    oPool    = require('./../../../objects_pool');

/*
 Пометить новых друзей/гостей/подарки - как просмотренные
 */
module.exports = function (socket, options, callback) {
  
  oPool.userList[socket.id].view(options[constants.PFIELDS.TARGET], function (err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
  
};