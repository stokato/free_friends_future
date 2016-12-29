/**
 * Получаем дату начала недели
 * @param date
 * @return {Date}
 */

module.exports = function(date) {
  let  day       = date.getDay();
  let  monthDay  = date.getDate();
  let  newDate   = new Date(date.toString());
  
  newDate.setDate(monthDay - day + 1);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
};