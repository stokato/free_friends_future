var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Найти подарок пользователя по его id
 */
module.exports = function(id, callback) {
  var self = this;
  if (!id) { return callback(new Error("Задан пустой Id пользователя"), null);}

  //var f = C.IO.FIELDS;

  var fields = ["giftid", "type", "src", "date", "title", "fromid", "fromvid"];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERGIFTS, ["id"], [1]);

  self.client.execute(query,[id], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var gifts = [];

    var rowsLen = result.rows.length;

    if(rowsLen > 0) {
      var row = result.rows[0];

      var gift = {};
      gift["gid"]     = id;
      gift["giftid"]  = row["giftid"].toString();
      gift["type"]    = row["type"];
      gift["src"]     = row["src"];
      gift["date"]    = row["date"];
      gift["title"]   = row["title"];
      gift["fromid"]  = row["fromid"].toString();
      gift["fromvid"] = row["fromvid"].toString();

      gifts.push(gift);

      callback(null, gift);

    } else {
      callback(null, null);
    }
  });
};