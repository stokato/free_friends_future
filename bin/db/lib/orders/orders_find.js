var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.ORDERS.fields;
var PF = dbConst.PFIELDS;

/*
 Найти все заказы пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {
  if(!userid) { return callback(new Error("Не задан ИД пользователя"), null); }

  var fields = [
    DBF.ID_uuid_p,
    DBF.VID_varchar,
    DBF.GOODID_varchar,
    DBF.SUM_int,
    DBF.DATE_timestamp
  ];
  var constFields = [DBF.USERID_uuid_i];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.DB.ORDERS.name, constFields, constValues);

  cdb.client.execute(query,[userid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var orders = [], order, row;
    
    for (var i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      order = {};
      order[PF.ORDERID]   = row[DBF.ID_uuid_p].toString();
      order[PF.ORDERVID]  = row[DBF.VID_varchar];
      order[PF.GOODID]    = row[DBF.GOODID_varchar];
      order[PF.SUM]       = row[DBF.SUM_int];
      order[PF.DATE]      = row[DBF.DATE_timestamp];

      orders.push(order);
    }

    callback(null, orders);
  });
};