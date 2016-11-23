/**
 * Created by s.t.o.k.a.t.o on 23.11.2016.
 */

module.exports = function (bday) {
  return (new Date().getYear() - bday.getYear());
};