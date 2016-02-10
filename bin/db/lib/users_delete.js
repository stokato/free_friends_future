/*
 Удаляем пользователя: ИД
 - Проверка на ИД
 - Возвращаем ИД
 */
module.exports = function(id, callback) {
    if (!id) { callback(new Error("Задан пустой Id")); }

    var query = "DELETE FROM users WHERE id = ?";

    this.client.execute(query, [id], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, id);
    });
};