/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Добавляем обработчики для событий профиля
 */

var handleAddPoints = require('./handle_add_points');

module.exports = function (profile) {
  
  profile.setOnAddPoints(handleAddPoints);
  
};