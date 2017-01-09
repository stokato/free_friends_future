const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.DB.ORDERS.fields;
const PF  = dbConst.PFIELDS;

/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) { options   = options || {};

  let date    = options[PF.DATE] || new Date;

  if (!options[PF.ORDERVID] || !options[PF.ID] || !options[PF.VID] || !options[PF.SUM]) {
    return callback(new Error("Не задан один из параметров заказа"), null);
  }

  let id = cdb.uuid.random();

  let fields = [
    DBF.ID_uuid_p,
    DBF.VID_varchar,
    DBF.USERID_uuid_i,
    DBF.USERVID_varchar,
    DBF.SUM_int,
    DBF.DATE_timestamp
  ];
  
  let params = [
    id,
    options[PF.ORDERVID],
    options[PF.ID],
    options[PF.VID],
    options[PF.SUM],
    date
  ];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.ORDERS.name);

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });

};
