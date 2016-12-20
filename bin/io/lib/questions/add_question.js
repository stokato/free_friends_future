/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 *
 * Добавляем ворос пользователя в базу
 *
 */

var PF =  require('./../../../constants').PFIELDS,
  oPool    = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  oPool.userList[socket.id].addQuestion(options[PF.TEXT],
      options[PF.IMAGE_1], options[PF.IMAGE_2], options[PF.IMAGE_3],  function (err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
  
};