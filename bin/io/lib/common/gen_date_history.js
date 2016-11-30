/**
 * Получаем дату начала недели
 * @param date
 * @return {Date}
 */

module.exports = function(date) {
  var day       = date.getDay();
  var monthDay  = date.getDate();
  var newDate   = new Date(date.toString());
  
  newDate.setDate(monthDay - day + 1);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
};