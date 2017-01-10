const cdb = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.USER_GIFTS.fields;
const PF = constants.PFIELDS;

/*
 Найти подарок пользователя по его id
 */
module.exports = function(id, callback) {
  if (!id) { return callback(new Error("Задан пустой Id пользователя"), null);}

  let fields = [
    DBF.GIFTID_varchar,
    DBF.TYPE_varchar,
    DBF.SRC_varhar,
    DBF.DATE_timestamp,
    DBF.TITLE_varchar,
    DBF.FROMID_uuid,
    DBF.FROMVID_varchar
  ];
  
  let constFields = [DBF.ID_uuid_p];
  let constValues = [1];
  let dbName = dbConst.USER_GIFTS.name;

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);

  cdb.client.execute(query,[id], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length > 0) {
      let row = result.rows[0];

      let gift = {
        [PF.UGIFTID] : id,
        [PF.GIFTID]  : row[DBF.GIFTID_varchar],
        [PF.TYPE]    : row[DBF.TYPE_varchar],
        [PF.SRC]     : row[DBF.SRC_varhar],
        [PF.DATE]    : row[DBF.DATE_timestamp],
        [PF.TITLE]   : row[DBF.TITLE_varchar],
        [PF.FID]     : row[DBF.FROMID_uuid].toString(),
        [PF.FVID]    : row[DBF.FROMVID_varchar]
      };

      callback(null, gift);
    } else {
      callback(null, null);
    }
  });
};