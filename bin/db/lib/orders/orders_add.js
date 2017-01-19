const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF = require('./../../../const_fields');

const DBF = DB_CONST.ORDERS.fields;

/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) { options   = options || {};

  let date    = options[PF.DATE] || new Date;

  if (!options[PF.ORDERVID] || !options[PF.ID] || !options[PF.VID] || !options[PF.SUM]) {
    return callback(new Error("Не задан один из параметров заказа"), null);
  }

  let id = dbCtrlr.uuid.random();

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
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fields, DB_CONST.ORDERS.name);

  dbCtrlr.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });

};
