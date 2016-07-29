var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Получаем список всех пользователей: список искомых полей
 - Строим и выполняем запрос
 - Создаем массив и заполняем его данными
 - Возвращяем массив (если никого нет - NULL)
 */
module.exports = function(f_list, callback) {
  //var f = C.IO.FIELDS;

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
       //var row = result.rows[i];
       //
       //var user = {};
       //user[f.id]       = row[f.id].toString();
       //user[f.vid]      = row[f.vid];
       //user[f.age]      = row[f.age];
       //user[f.country]  = row[f.country];
       //user[f.city]     = row[f.city];
       //user[f.sex]      = row[f.sex];
       //user[f.status]   = row[f.status];
       //user[f.points]   = row[f.points];
       //user[f.money]    = row[f.money];
       //user[f.newfriends] = row[f.newfriends];
       //user[f.newguests] = row[f.newguests];
       //user[f.newgifts] = row[f.newgifts];
       //user[f.newmessages] = row[f.newmessages];
       //user[f.is_in_menu] = row[f.is_in_menu];
       //user[f.gift1] = row[f.gift1];

       var user = result.rows[i];
       user.id = user.id.toString();

       users.push(user);
     }
   }

   callback(null, users);
 });
};
