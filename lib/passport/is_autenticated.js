/**
 * Created by s.t.o.k.a.t.o on 21.12.2016.
 *
 * Проверяем, авторизирован ли пользователь
 */

module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.statusCode = 401;
  res.end();
};