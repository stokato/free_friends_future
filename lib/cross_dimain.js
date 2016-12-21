/**
 * Created by s.t.o.k.a.t.o on 21.12.2016.
 *
 * Разрешаем обращение со сторонних доменов
 *
 */

module.exports = function (rec, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); //, OPTIONS, PUT, PATCH, DELETE
  
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, content-type, Authorization');
  
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  next();
};