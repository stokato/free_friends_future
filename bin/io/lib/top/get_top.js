var constants  = require('./../../../constants'),
    db         = require('./../../../db_manager');

/*
 Показать топ пользователей
 - Получаем пользоватлей, всех вместе и по полам
 - Отправляем клиенту
 */
module.exports = function (socket, options, callback) {
  
    var res = {};
    db.findPoints(null, function (err, users) {
      if (err) { return callback(options, err.message); }
      res[constants.PFIELDS.ALL] = users;

      db.findPoints(constants.GIRL, function (err, users) {
        if (err) { return callback(options, err.message); }
        res[constants.PFIELDS.GIRLS] = users;

        db.findPoints(constants.GUY, function (err, users) {
          if (err) { return callback(options, err.message); }

          res[constants.PFIELDS.GUYS] = users;

          callback(null, res);
        });
      });
    });
  
};

