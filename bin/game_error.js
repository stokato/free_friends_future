// Свой объект ошибок
function GameError(socket, func, message) {
    var err = {};
    err.message = message;
    err.stack = (new Error()).stack;

    switch(func) {
        case "INIT"       : err.name = "Ошибка инициализации";
            break;
        case "EXIT"       : err.name = "Ошибка отключения от игры";
            break;
        case "CHOOSEROOM" : err.name = "Ошибка открытия окна смены стола";
            break;
        case "SHOWROOMS"  : err.name = "Ошибка открытия окна доступных столов";
            break;
        case "CHANGEROOM" : err.name = "Ошибка смены стола";
            break;
        case "SHOWPROFILE": err.name = "Ошибка открытия окна профиля";
            break;
        case "SHOWHISTORY": err.name = "Ошибка открытия окна личных сообщений";
            break;
        case "SHOWGIFTS"  : err.name = "Ошибка открытия окна подарков";
            break;
        case "MAKEGIFT"   : err.name = "Ошибка совершения подарка";
            break;
        case "SHOWTOP"    : err.name = "Ошибка открытия топа игроков";
            break;
        case "SENDPUBMESSAGE" : err.name = "Ошибка отправки публичного сообщения";
            break;
        case "SENDPRIVMESSAGE" : err.name = "Ошибка отправки личного сообщения";
            break;
        case "SHOWGIFTSHOP" : err.name = "Ошибка открытия окна магазина подарков";
            break;
        case "ADDFRIEND" : err.name = "Ошибка добавления в друзья";
            break;
        case "CHANGESTATUS" : err.name = "Ошибка изменения статуса";
            break;
        case "GAMEBOTTLE" : err.name = "Игра остановлена. Ошибка в игре бутылочка";
            break;
        case "GAMEQUESTIONS" : err.name = "Игра остановлена. Ошибка в игре Вопросы";
            break;
        case "GAMECARDS" : err.name = "Игра остановлена. Ошибка в игре Золото";
            break;
        case "GAMEBEST" : err.name = "Игра остановлена. Ошибка в игре Кто больше нравится";
            break;
        case "GAMESYMPATHY" : err.name = "Игра остановлена. Ошибка в игре Симпатии";
            break;
        default:  err.name =   "Неизвестная ошибка"
    }
    console.log(err.name + " : " + err.message);
    console.log(err.stack);

    if(socket)
        socket.emit('error', err);
}
GameError.prototype = Object.create(Error.prototype);
GameError.prototype.constructor = GameError;

module.exports = GameError;