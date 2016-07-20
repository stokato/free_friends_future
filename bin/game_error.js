var constants_io = require('./io/constants');
var constants_game = require('./game/constants');

// Свой объект ошибок
function GameError(socket, func, message) {
 var err = {};
 err.message = message;
 err.stack = (new Error()).stack;

 switch(func) {
   case constants_io.IO_INIT                    : err.name = "Ошибка инициализации";
     break;
   case constants_io.IO_DISCONNECT              : err.name = "Ошибка отключения от игры";
     break;
   case constants_io.IO_CHOOSE_ROOM             : err.name = "Ошибка открытия окна смены стола";
     break;
   case constants_io.IO_GET_ROOMS               : err.name = "Ошибка открытия окна доступных столов";
     break;
   case constants_io.IO_CHANGE_ROOM             : err.name = "Ошибка смены стола";
     break;
   case constants_io.IO_GET_PROFILE             : err.name = "Ошибка открытия окна профиля";
     break;
   //case "GETHISTORY"         : err.name = "Ошибка открытия окна личных сообщений";
   //  break;
   //case "GETGIFTS"           : err.name = "Ошибка открытия окна подарков";
   //  break;
   case constants_io.IO_GET_MONEY               : err.name = "Ошибка получения баланса";
     break;
   case constants_io.IO_MAKE_GIFT               : err.name = "Ошибка совершения подарка";
     break;
   case constants_io.IO_GET_TOP                 : err.name = "Ошибка открытия топа игроков";
     break;
   case constants_io.IO_MESSAGE                 : err.name = "Ошибка отправки сообщения";
     break;
   case constants_io.IO_PRIVATE_MESSAGE         : err.name = "Ошибка отправки личного сообщения";
     break;
   case constants_io.IO_GET_GIFT_SHOP           : err.name = "Ошибка открытия окна магазина подарков";
     break;
   case constants_io.IO_GET_MONEY_SHOP          : err.name = "Ошибка открытия окна пополения баланса";
     break;
   case constants_io.IO_ADD_FRIEND              : err.name = "Ошибка добавления в друзья";
     break;
   case constants_io.IO_CHANGE_STATUS           : err.name = "Ошибка изменения статуса";
     break;
   //case "OPENPRIVATEMESSAGE" : err.name = "Ошибка изменения статуса сообещения как открытого";
   //  break;
   case constants_io.IO_GET_CHAT_HISTORY        : err.name = "Ошибка получения истории сообщений";
     break;
   case constants_io.IO_OPEN_PRIVATE_CHAT       : err.name = "Ошибка открытия приватного чата";
     break;
   case constants_io.IO_CLOSE_PRIVATE_CHAT      : err.name = "Ошибка закрытия приватного чата";
     break;
   case constants_io.IO_ADD_POINTS              : err.name = "Ошибка добавления очков пользователю";
     break;
   case constants_game.G_BOTTLE                 : err.name = "Ошибка в игре бутылочка";
     break;
   case constants_game.G_QUESTIONS              : err.name = "Ошибка в игре Вопросы";
     break;
   case constants_game.G_CARDS                  : err.name = "Ошибка в игре Золото";
     break;
   case constants_game.G_BEST                   : err.name = "Ошибка в игре Кто больше нравится";
     break;
   case constants_game.G_SYMPATHY               : err.name = "Ошибка в игре Симпатии";
     break;
   case constants_io.IO_RELEASE_PLAYER          : err.name = "Ошибка при выкупе игрока";
   break;
   case constants_io.IO_DEL_FROM_FRIENDS        : err.name = "Ошибка при удалении пользователя";
   case constants_io.IO_GIVE_MONEY              : err.name = "Ошибка при передаче монет";
     break;
     break;
   default:  err.name =   "Неизвестная ошибка"
 }
 console.log(err.name + " : " + err.message);
 console.log(err.stack);

 if(socket) {
   socket.emit(constants_io.IO_ERROR, err);
 }

}
GameError.prototype = Object.create(Error.prototype);
GameError.prototype.constructor = GameError;

module.exports = GameError;