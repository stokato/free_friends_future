var Q_SELECT = "select",
    Q_INSERT = "insert",
    Q_UPDATE = "update",
    Q_DELETE = "delete";

module.exports.Q_SELECT = Q_SELECT;
module.exports.Q_INSERT = Q_INSERT;
module.exports.Q_UPDATE = Q_UPDATE;
module.exports.Q_DELETE = Q_DELETE;

module.exports.ALL_FIELDS = "*";

//"select companionid, isnew FROM user_chats where userid = ?"
//"INSERT INTO user_friends (" + fields + ") VALUES (" + values + ")";
//"DELETE FROM user_friends WHERE userid = ?";
//"update user_messages set " + fields + where userid = ? and companionid = ? and id = ?";
module.exports.build = function(type, fields, table, const_fields, const_values) {
  var query = type, i;

  switch (type) {
    case Q_SELECT : /////////////////////////////////////////////////////////////////////
      query += " ";
      for (i = 0; i < fields.length; i++) {
        query += (i < fields.length - 1) ? fields[i] + ", " : fields[i];
      }

      query += " from " + table;
      break;
    case Q_INSERT : /////////////////////////////////////////////////////////////////////
      query += " into " + table + " (";
      var params = "";

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
    case Q_UPDATE : /////////////////////////////////////////////////////////////////////
      query += " " + table + " set ";

      for (i = 0; i < fields.length; i++) {
        query += (i < fields.length - 1) ? fields[i] + " = ?, " : fields[i] + " = ?";
      }
      break;
    case Q_DELETE : /////////////////////////////////////////////////////////////////////
      query += " from " + table;
      break;
  }

  query = buildConstraints(query, const_fields, const_values);

  return query;
};

function buildConstraints(query, const_fields, const_values) {
  if(!const_fields) { return query; }

  query += " where";
  for(i = 0; i < const_fields.length; i++) {
    query += " " + const_fields[i];
    query += (const_values[i] == 0) ? " = ?" : buildPluralConstraintValues(const_values[i]);
    query += (i < const_fields.length-1) ? " and " : "";
  }
  return query;
}

function buildPluralConstraintValues(count) {
  var i, constraint = "in (";
  for(i = 0; i < count; i++) {
    constraint += (i < count-1) ? "?, " : "?";
  }
  constraint += ")";
  return constraint;
}