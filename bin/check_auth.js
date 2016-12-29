/**
 * Created by s.t.o.k.a.t.o on 24.11.2016.
 *
 * Проверяем аутентификацию
 */
const  md5        = require('md5');

const  logger     = require('./../lib/log')(module);
const  Config     = require('./../config.json');
const  constants  = require('./constants');
const  oPool      = require('./objects_pool');


module.exports = function (em, socket, options) {
  if(em == constants.IO_INIT) {
    if(("auth_key" in options) == false) {
      logger.error(em + " " + "Отсутствует подпись запроса");
      return false;
    } else if (em == constants.IO_INIT) {
      return compareAuthKey(options[constants.PFIELDS.VID]);
    } else {
      let  vid = oPool.userList[socket.id].getVID();
      return compareAuthKey(vid);
    }
  } else {
    return (socket.handshake.session.authorized == true);
  }
  
  //-------------------------------
  function compareAuthKey(vid) {
    if(options[constants.PFIELDS.AUTHKEY] === md5(Config.auth.APIID + "_" + vid + "_" + Config.auth.APISECRET)) {
      return true;
    } else {
      logger.error(em + " " + "Несовпадение вычисленной и переданной подписи запроса.");
      return false;
    }
  }
};