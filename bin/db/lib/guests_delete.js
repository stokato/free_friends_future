/*
 Удалить всех гостей игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех гостей игрока (нужны их ИД для удаления)
 - По каждому найденному выполняем запрос на его удаление (параллельно)
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
    if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

    var query = "DELETE FROM user_guests where user = ?";
    this.client.execute(query, [uid], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, uid);
    });
};