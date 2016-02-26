var constants = require('./../constants_io');

module.exports = function(date) {
  //var len = constants.LEN_PRIVATE_HISTORY;
  var day = date.getDay();
  var monthDay = date.getDate();
  var newDate = new Date(date.toString());
  newDate.setDate(monthDay - day + 1);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
};