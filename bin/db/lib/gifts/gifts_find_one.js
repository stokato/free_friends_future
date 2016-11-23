var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_GIFTS.fields;
var PF = dbConst.PFIELDS;

/*
 Найти подарок пользователя по его id
 */
module.exports = function(id, callback) {
  if (!id) { return callback(new Error("Задан пустой Id пользователя"), null);}

  var fields = [
    DBF.GIFTID_varchar,
    DBF.TYPE_varchar,
    DBF.SRC_varhar,
    DBF.DATE_timestamp,
    DBF.TITLE_varchar,
    DBF.FROMID_uuid,
    DBF.FROMVID_varchar
  ];
  
  var constFields = [DBF.ID_uuid_p];
  var constValues = [1];
  var dbName = dbConst.DB.USER_GIFTS.name;

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);

  cdb.client.execute(query,[id], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length > 0) {
      var row = result.rows[0];

      var gift = {};
      gift[PF.UGIFTID] = id;
      gift[PF.GIFTID]  = row[DBF.GIFTID_varchar];
      gift[PF.TYPE]       = row[DBF.TYPE_varchar];
      gift[PF.SRC]        = row[DBF.SRC_varhar];
      gift[PF.DATE]       = row[DBF.DATE_timestamp];
      gift[PF.TITLE]      = row[DBF.TITLE_varchar];
      gift[PF.FID]   = row[DBF.FROMID_uuid].toString();
      gift[PF.FVID]  = row[DBF.FROMVID_varchar];

      callback(null, gift);
    } else {
      callback(null, null);
    }
  });
};