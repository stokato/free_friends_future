/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Добавляем обработчики для событий профиля
 */

const handleAddPoints = require('./handle_add_points');
const handlePay       = require('./handle_pay');

module.exports = function (profile) {
  
  profile.setOnAddPoints(handleAddPoints);
  profile.setOnPay(handlePay);
  
};