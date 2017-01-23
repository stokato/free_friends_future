const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Найти подарок пользователя по его id
 */
module.exports = function(id, callback) {
  
  const DBF = DB_CONST.USER_GIFTS.fields;
  const DBN = DB_CONST.USER_GIFTS.name;
  
  if (!id) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }

  let fieldsArr = [
    DBF.GIFTID_varchar,
    DBF.TYPE_varchar,
    DBF.SRC_varhar,
    DBF.DATE_timestamp,
    DBF.TITLE_varchar,
    DBF.FROMID_uuid,
    DBF.FROMVID_varchar,
    DBF.COUNT_int
  ];
  
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [1];
  let paramsArr     = [id];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    if(result.rows.length > 0) {
      let rowObj = result.rows[0];

      let giftObj = {
        [PF.UGIFTID] : id,
        [PF.GIFTID]  : rowObj[DBF.GIFTID_varchar],
        [PF.TYPE]    : rowObj[DBF.TYPE_varchar],
        [PF.SRC]     : rowObj[DBF.SRC_varhar],
        [PF.DATE]    : rowObj[DBF.DATE_timestamp],
        [PF.TITLE]   : rowObj[DBF.TITLE_varchar],
        [PF.FID]     : rowObj[DBF.FROMID_uuid].toString(),
        [PF.FVID]    : rowObj[DBF.FROMVID_varchar],
        [PF.COUNT]   : rowObj[DBF.COUNT_int]
      };

      callback(null, giftObj);
    } else {
      callback(null, null);
    }
  });
};