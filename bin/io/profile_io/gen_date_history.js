var constants = require('./../constants_io');

module.exports = function(date) {
  //var len = constants.LEN_PRIVATE_HISTORY;
  var day = date.getDay();
  var monthDay = date.getDate();
  date.setDate(monthDay - day);
  date.setHours(0, 0, 0, 0);
  console.log(date);
  return date;
};