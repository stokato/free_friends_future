/**
 *
 * @type {string}
 *
 * Построитель запросов к базе данных
 */

const Q_SELECT = "select",
      Q_INSERT = "insert",
      Q_UPDATE = "update",
      Q_UPDATE_COUNTER = "update_counter",
      Q_DELETE = "delete";

module.exports.Q_SELECT = Q_SELECT;
module.exports.Q_INSERT = Q_INSERT;
module.exports.Q_UPDATE = Q_UPDATE;
module.exports.Q_UPDATE_COUNTER = Q_UPDATE_COUNTER;
module.exports.Q_DELETE = Q_DELETE;

module.exports.ALL_FIELDS = "*";

//"select companionid, isnew FROM user_chats where userid = ?"
//"INSERT INTO user_friends (" + fields + ") VALUES (" + values + ")";
//"DELETE FROM user_friends WHERE userid = ?";
//"update user_messages set " + fields + where userid = ? and companionid = ? and id = ?";

module.exports.build = function(type, fields, table,
                                const_fields, const_values, const_more, const_less,
                                order_by, desc_limit) {
  let query = type, i;

  switch (type) {
    case Q_SELECT : //-------------------------------------------------------------------
      query += " ";
      for (i = 0; i < fields.length; i++) {
        query += (i < fields.length - 1) ? fields[i] + ", " : fields[i];
      }

      query += " from " + table;
      break;
    case Q_INSERT : //-------------------------------------------------------------------
      query += " into " + table + " (";
      let params = "";

      for (i = 0; i < fields.length; i++) {
        if(i < fields.length - 1) {
          query += fields[i] + ", ";
          params += "?, ";
        } else {
          query += fields[i];
          params += "?";
        }
      }

      query += ") values (" + params + ")";
      break;
    case Q_UPDATE : //-------------------------------------------------------------------
      query += " " + table + " set ";

      for (i = 0; i < fields.length; i++) {
        query += (i < fields.length - 1) ? fields[i] + " = ?, " : fields[i] + " = ?";
      }
      break;
    case Q_UPDATE_COUNTER : //-------------------------------------------------------------------
      query = Q_UPDATE;
      query += " " + table + " set ";
    
      for (i = 0; i < fields.length; i++) {
        query += (i < fields.length - 1) ?
                  fields[i] + " = " + fields[i] + " + ?, " :
                  fields[i] + " = " + fields[i] + " + ?";
      }
      break;
    case Q_DELETE : //-------------------------------------------------------------------
      query += " from " + table;
      break;
  }

  query = buildConstraints(query, const_fields, const_values, const_more, const_less);

  query += (order_by) ? " order by " + order_by : "";
  query += (desc_limit) ? " limit " + desc_limit : "";

  return query;
};

// Добавляем строку WHERE
function buildConstraints(query, const_fields, const_values, const_more, const_less) {
  if(!const_fields) { return query; }

  query += " where";
  for(let i = 0; i < const_fields.length; i++) {
    query += " " + const_fields[i];
    query += (const_values[i] == 1) ? " = ?" : buildPluralConstraintValues(const_values[i]);
    query += (i < const_fields.length-1) ? " and " : "";
  }

  query += (const_more) ? " and " + const_more + " > ?" : "";
  query += (const_less) ? " and " + const_less + " < ?" : "";

  return query;
}

// Для выбора из нескольких допустимых значений
function buildPluralConstraintValues(count) {
  let constraint = " in (";
  for(let i = 0; i < count; i++) {
    constraint += (i < count-1) ? "?, " : "?";
  }
  constraint += ")";
  return constraint;
}