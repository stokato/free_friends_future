var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Получаем список всех пользователей: список искомых полей
 - Строим и выполняем запрос
 - Создаем массив и заполняем его данными
 - Возвращяем массив (если никого нет - NULL)
 */
module.exports = function(f_list, callback) {
  var f = C.IO.FIELDS;

 var query = qBuilder.build(qBuilder.Q_SELECT, f_list, C.T_USERS);

 this.client.execute(query,[], {prepare: true }, function(err, result) {
   if (err) { return callback(err, null);}

   var users = [];

   var i;
   var rowsLen = result.rows.length;
   if(rowsLen > 0) {
     for(i = 0; i < rowsLen; i++) {
       var row = result.rows[i];

       var user = {};
       user[f.id]       = row[f.id].toString();
       user[f.vid]      = row[f.vid];
       user[f.age]      = row[f.age];
       user[f.country]  = row[f.country];
       user[f.city]     = row[f.city];
       user[f.sex]      = row[f.sex];
       user[f.status]   = row[f.status];
       user[f.points]   = row[f.points];
       user[f.money]    = row[f.money];
       user[f.newfriends] = row[f.newfriends];
       user[f.newguests] = row[f.newguests];
       user[f.newgifts] = row[f.newgifts];
       user[f.newmessages] = row[f.newmessages];

       users.push(user);
     }
   }

   callback(null, users);
 });
};
