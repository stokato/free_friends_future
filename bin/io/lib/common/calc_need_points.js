/**
 * Created by s.t.o.k.a.t.o on 29.12.2016.
 *
 * Вычисляем, склько необходимо набрать очков для указанного уровня
 */

module.exports = function calcNeedPoints(nl, start, step) {
  let np = 0;
  let prev = 0;
  for (let i = 0; i < nl; i++) {
    if(i == 0) {
      np = start;
      prev += start;
    } else {
      np = np + prev + step;
      prev += step;
    }
  }
  
  return np;
};