var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.ORDERS.fields;
var PF = dbConst.PFIELDS;

/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) { options   = options || {};

  var date    = options[PF.DATE] || new Date;

  if (!options[PF.ORDERVID] || !options[PF.ID] || !options[PF.VID] || !options[PF.SUM]) {
    return callback(new Error("Не задан один из параметров заказа"), null);
  }

  var id = cdb.uuid.random();

  var fields = [
    DBF.ID_uuid_p,
    DBF.VID_varchar,
    DBF.USERID_uuid_i,
    DBF.USERVID_varchar,
    DBF.SUM_int,
    DBF.DATE_timestamp
  ];
  
  var params = [
    id,
    options[PF.ORDERVID],
    options[PF.ID],
    options[PF.VID],
    options[PF.SUM],
    date
  ];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.ORDERS.name);

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });

};
