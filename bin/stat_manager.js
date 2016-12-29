/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Модуль работы со статистикой
 */

// Модуль работы с БД
const StatManager   = require('./stat/index.js'),
      stat          = new StatManager();

module.exports = stat;