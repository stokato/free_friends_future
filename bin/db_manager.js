// Модуль работы с БД
var DBManager                    = require('./db/index.js'),
  db = new DBManager();

module.exports = db;