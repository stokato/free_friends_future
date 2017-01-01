var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USERS.fields;
var PF = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

/*
 Найти пользователя(по внутреннему или внешнему ИД): ИД, ВИД, список искомых полей
 - Проверка
 - Определяем - по чему будем искать
 - Строим запрос
 - Обращаемся к БД и обрабатываем рузультат
 - Возвращаем объект с данными игрока (если нет такого - NULL)
 */
module.exports = function(id, vid, f_list, callback) {
  if (!vid && !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
  }

  var constraint = '';
  var param = [];

  if(id) {
    constraint = DBF.ID_uuid_p;
    param.push(id);
  } else {
    constraint = DBF.VID_varchar_i;
    param.push(vid);
  }

  var i, fields = [DBF.ID_uuid_p, DBF.VID_varchar_i];
  for(i = 0; i < f_list.length; i++) {
    switch (f_list[i]) {
      case PF.ID          : fields.push(DBF.ID_uuid_p);       break;
      case PF.VID         : fields.push(DBF.VID_varchar_i);   break;
      case PF.BDATE       : fields.push(DBF.BDATE_timestamp); break;
      case PF.CITY        : fields.push(DBF.CITY_int);        break;
      case PF.COUNTRY     : fields.push(DBF.COUNTRY_int);     break;
      case PF.SEX         : fields.push(DBF.SEX_int);         break;
      case PF.STATUS      : fields.push(DBF.STATUS_varchar);  break;
      case PF.POINTS      : fields.push(DBF.POINTS_int);      break;
      case PF.GIFT1       : fields.push(DBF.MONEY_int);       break;
      case PF.ISMENU      : fields.push(DBF.ISMENU_boolean);  break;
      case PF.MONEY       : fields.push(DBF.MONEY_int);       break;
      case PF.LEVEL       : fields.push(DBF.LEVEL_int);       break;
      case PF.FREE_GIFTS  : fields.push(DBF.FREE_GIFTS_int);  break;
      case PF.FREE_TRACKS : fields.push(DBF.FREE_MUSIC_int);  break;
      case PF.VIP         : fields.push(DBF.VIP_boolean);     break;
    }
  }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.DB.USERS.name, [constraint], [1]);

  cdb.client.execute(query, param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
        
    if(result.rows.length > 0) {
      
      var row = result.rows[0];

      var user = {};
      user[PF.ID]           = row[DBF.ID_uuid_p].toString();
      user[PF.VID]          = row[DBF.VID_varchar_i];
      user[PF.BDATE]        = row[DBF.BDATE_timestamp];
      user[PF.CITY]         = row[DBF.CITY_int];
      user[PF.COUNTRY]      = row[DBF.COUNTRY_int];
      user[PF.SEX]          = row[DBF.SEX_int];
      user[PF.STATUS]       = row[DBF.STATUS_varchar];
      user[PF.POINTS]       = row[DBF.POINTS_int];
      user[PF.GIFT1]        = (row[DBF.GIFT1_uuid])? row[DBF.GIFT1_uuid].toString() : null;
      user[PF.ISMENU]       = row[DBF.ISMENU] || null;
      user[PF.MONEY]        = Number(row[DBF.MONEY_int]);
      user[PF.LEVEL]        = Number(row[DBF.LEVEL_int]);
      user[PF.FREE_GIFTS]   = Number(row[DBF.FREE_GIFTS_int]);
      user[PF.FREE_TRACKS]  = Number(row[DBF.FREE_MUSIC_int]);
      user[PF.VIP]          = Number(row[DBF.VIP_boolean]);
      
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
