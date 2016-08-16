var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Получаем список всех пользователей: список искомых полей
 - Строим и выполняем запрос
 - Создаем массив и заполняем его данными
 - Возвращяем массив (если никого нет - NULL)
 */
module.exports = function(f_list, callback) {

  var i, fields = ["id", "vid"];
  for(i = 0; i < f_list.length; i++) {
    fields.push(f_list[i]);
  }

 var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERS);

 this.client.execute(query,[], {prepare: true }, function(err, result) {
   if (err) { return callback(err, null);}

   var users = [];

   var i;
   var rowsLen = result.rows.length;
   if(rowsLen > 0) {
     for(i = 0; i < rowsLen; i++) {

       var user = result.rows[i];
       user.id = user.id.toString();

       users.push(user);
     }
   }

   callback(null, users);
 });
};
