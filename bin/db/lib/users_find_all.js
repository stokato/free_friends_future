/*
 ѕолучаем список всех пользователей: список искомых полей
 - —троим и выполн€ем запрос
 - —оздаем массив и заполн€ем его данными
 - ¬озвращ€ем массив (если никого нет - NULL)
 */
module.exports = function(f_list, callback) {

    var fields = [];
    for(var i = 0; i < f_list.length; i++) {
        if(f_list == "age") fields += ", age";
        if(f_list == "location") fields += ", location";
        if(f_list == "status") fields += ", status";
        if(f_list == "gender") fields += ", gender";
        if(f_list == "points") fields += ", points";
        if(f_list == "money") fields += ", money";
    }

    var query = "select id" + fields + " FROM users";

    this.client.execute(query,[], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null);}

        var users = [];

        if(result.rows.length > 0) {
            for(var i = 0; i < result.rows.length; i++) {
                var us = result.rows[i];
                var user = {
                    id : us.id,
                    vid    : us.vid,
                    age : us.age,
                    location : us.location,
                    gender   : us.gender,
                    status : us.status,
                    points   : us.points,
                    money  : us.money
                };
                users.push(user);
            }
        }

        callback(null, users);
    });
};
