/*
 Найти пользователя(по внутреннему или внешнему ИД): ИД, ВИД, списко искомых полей
 - Проверка
 - Определяем - по чему будем искать
 - Строим запрос
 - Обращаемся к БД и обрабатываем рузультат
 - Возвращаем объект с данными игрока (если нет такого - NULL)
 */
module.exports = function(id, vid, f_list, callback) {
    if (!vid && !id) {
        return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
    }
    var search = '';
    var param = [];

    if(id) {
        search = "id";
        param.push(id);
    }
    else {
        search = "vid";
        param.push(vid);
    }

    var fields = '';
    for(var i = 0; i < f_list.length; i++) {
        if(f_list[i] == "age")      fields += ", age";
        if(f_list[i] == "location") fields += ", location";
        if(f_list[i] == "status")   fields += ", status";
        if(f_list[i] == "gender")   fields += ", gender";
        if(f_list[i] == "points")   fields += ", points";
        if(f_list[i] == "money")    fields += ", money";
    }


    var query = "select id, vid " + fields + " FROM users where " + search +" = ?";

    this.client.execute(query,param, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        if(result.rows.length > 0) {
            var us = result.rows[0];
            var user = {
                id : us.id,
                age : us.age,
                location : us.location,
                gender   : us.gender,
                points   : us.points,
                status : us.status,
                money : us.money,
                vid : us.vid
            };

            callback(null, user);
        } else {
            callback(null, null);
        }
    });
};
