const constants = require('./../../../constants');
const logger = require('./../../../../lib/log')(module);

// Свой объект ошибок
function GameError(func, message) {
 let err = {
   message : message,
   stack   : (new Error()).stack
 };

 switch(func) {
   case constants.G_BOTTLE                   : err.name = "Ошибка в игре бутылочка";                      break;
   case constants.G_QUESTIONS                : err.name = "Ошибка в игре Вопросы";                        break;
   case constants.G_CARDS                    : err.name = "Ошибка в игре Золото";                         break;
   case constants.G_BEST                     : err.name = "Ошибка в игре Кто больше нравится";            break;
   case constants.G_SYMPATHY                 : err.name = "Ошибка в игре Симпатии";                       break;
   case constants.IO_RELEASE_PLAYER          : err.name = "Ошибка при выкупе игрока";                     break;

   default:  err.name =   "Неизвестная ошибка"
 }

  logger.error(err.name + " : " + err.message);
  logger.error(err.stack);

}
GameError.prototype = Object.create(Error.prototype);
GameError.prototype.constructor = GameError;

module.exports = GameError;