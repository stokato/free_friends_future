/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Модуль работы со статистикой
 */

// Модуль работы с БД
const StatCtrlr     = require('./stat/index.js');
let statCtrlr       = new StatCtrlr();

module.exports = statCtrlr;