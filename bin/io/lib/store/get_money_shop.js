/**
 *  Получаем набор лотов для пополнения баланса
 *
 *  @param socket, options, callback
 *  @return {Object} - объект со списом лотов
 */

const constants   = require('./../../../constants');
const db          = require('./../../../db_manager');
const emitRes     = require('./../../../emit_result');

module.exports = function (socket, options) {

  db.findAllCoins(function (err, goods) {
    if (err) {  return emitRes(err, socket, constants.IO_GET_MONEY_SHOP); }
    
    emitRes(null, socket, constants.IO_GET_MONEY_SHOP, { [constants.PFIELDS.LOTS] : goods });
  });

};


