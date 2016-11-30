/**
 * Created by s.t.o.k.a.t.o on 30.11.2016.
 *
 * Получаем шаблон объекта трека
 *
 * @return track
 */

module.exports = function () {
  
  return {
    track_id    : null,   // Ид трека
    id          : null,   // Ид пользователя, поставившего трек
    vid         : null,   // и его вид
    likes       : 0,      // количество лайков к треку
    dislikes    : 0,      // и дизлайков
    duration    : 0       // длительность трека
  }
  
};