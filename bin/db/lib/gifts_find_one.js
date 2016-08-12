var C = require('../../constants');
var qBuilder = require('./build_query');

/*
 Найти подарок пользователя по его id
 */
module.exports = function(id, callback) {
  var self = this;
  if (!id) { return callback(new Error("Задан пустой Id пользователя"), null);}

  var fields = ["giftid", "type", "src", "date", "title", "fromid", "fromvid"];
  var constFields = ["id"];
  var constValues = [1];

  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERGIFTS, constFields, constValues);

  self.client.execute(query,[id], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var gifts = [];

    if(result.rows.length > 0) {
      var row = result.rows[0];

      var gift = result.rows[0];
      gift.gid     = id;
      gift.giftid  = gift.giftid.toString();
      gift.fromid  = gift.fromid.toString();
      gift.fromvid = gift.fromvid.toString();

      gifts.push(gift);

      callback(null, gift);
    } else {
      callback(null, null);
    }
  });
};