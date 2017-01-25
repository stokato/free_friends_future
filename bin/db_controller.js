// Модуль работы с БД
const DBManager                    = require('./db/index.js'),
      db = new DBManager();

module.exports = db;