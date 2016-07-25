var xssFilter = require('xss-filters');
var validator = require('validator');

function sanitize(str) {
  str = xssFilter.inHTMLData(str);
  str = validator.escape(str);

  return str.replace(/<[^>]+>/g,'');
}

module.exports = sanitize;