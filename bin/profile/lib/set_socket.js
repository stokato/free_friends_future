/*
 Устанавливаем сокет
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
module.exports = function(socket) {
 this.pSocket = socket;
};