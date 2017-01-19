/**
 * Created by s.t.o.k.a.t.o on 23.11.2016.
 *
 * Возващаем разницу в годах между годом рождения и текущим
 *
 * @param bday - год рождения
 * @return int - количество лет
 */

module.exports = function (bday) {
  if(!bday) {
    return 0;
  }
  
  return (new Date().getYear() - bday.getYear());
};