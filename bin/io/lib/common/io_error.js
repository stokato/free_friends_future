/**
 * Created by s.t.o.k.a.t.o on 24.11.2016.
 */
var constants = require('../../../constants');
var logger = require('./../../../../lib/log')(module);

// Свой объект ошибок
function IOError(func, message) {
  var err = {};
  err.message = message;
  err.stack = (new Error()).stack;
  
  switch(func) {
    case constants.IO_INIT                    : err.name = "Ошибка инициализации";                         break;
    case constants.IO_DISCONNECT              : err.name = "Ошибка отключения от игры";                    break;
    case constants.IO_CHOOSE_ROOM             : err.name = "Ошибка открытия окна смены стола";             break;
    case constants.IO_GET_ROOMS               : err.name = "Ошибка открытия окна доступных столов";        break;
    case constants.IO_CHANGE_ROOM             : err.name = "Ошибка смены стола";                           break;
    case constants.IO_GET_PROFILE             : err.name = "Ошибка открытия окна профиля";                 break;
    
    case constants.IO_GET_MONEY               : err.name = "Ошибка получения баланса";                     break;
    case constants.IO_MAKE_GIFT               : err.name = "Ошибка совершения подарка";                    break;
    case constants.IO_GET_TOP                 : err.name = "Ошибка открытия топа игроков";                 break;
    case constants.IO_MESSAGE                 : err.name = "Ошибка отправки сообщения";                    break;
    case constants.IO_PRIVATE_MESSAGE         : err.name = "Ошибка отправки личного сообщения";            break;
    case constants.IO_GET_GIFT_SHOP           : err.name = "Ошибка открытия окна магазина подарков";       break;
    case constants.IO_GET_MONEY_SHOP          : err.name = "Ошибка открытия окна пополения баланса";       break;
    case constants.IO_ADD_FRIEND              : err.name = "Ошибка добавления в друзья";                   break;
    case constants.IO_CHANGE_STATUS           : err.name = "Ошибка изменения статуса";                     break;
    
    case constants.IO_GET_CHAT_HISTORY        : err.name = "Ошибка получения истории сообщений";           break;
    case constants.IO_OPEN_PRIVATE_CHAT       : err.name = "Ошибка открытия приватного чата";              break;
    case constants.IO_CLOSE_PRIVATE_CHAT      : err.name = "Ошибка закрытия приватного чата";              break;
    case constants.IO_ADD_POINTS              : err.name = "Ошибка добавления очков пользователю";         break;
    case constants.IO_DEL_FROM_FRIENDS        : err.name = "Ошибка при удалении пользователя";             break;
    case constants.IO_GIVE_MONEY              : err.name = "Ошибка при передаче монет";                    break;
    
    case constants.IO_ADD_TRECK               : err.name = "Ошибка при добавлении трека в плей-лист";      break;
    case constants.IO_GET_TRACK_LIST          : err.name = "Ошибка при получении плей-листа";              break;
    case constants.IO_LIKE_TRACK              : err.name = "Ошибка при лайке трека";                       break;
    case constants.IO_DISLIKE_TRACK           : err.name = "Ошибка при дизлайке трека";                    break;
    
    default:  err.name =   "Неизвестная ошибка"
  }
  
  logger.error(err.name + " : " + err.message);
  logger.error(err.stack);
  
}
IOError.prototype = Object.create(Error.prototype);
IOError.prototype.constructor = IOError;

module.exports = IOError;