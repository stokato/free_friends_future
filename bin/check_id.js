/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 * 
 * Проверка на соответствие маске ИД
 */

module.exports = function (id) {
  let idRegExp = /[A-Za-z0-9]{8}-(?:[A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}/i;
  let ID_LEN = 36;
  
  let res = (id + "").search(idRegExp);
  
  return !!(res == 0 && id.length == ID_LEN);
};