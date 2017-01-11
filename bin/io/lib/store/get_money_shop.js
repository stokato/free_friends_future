/**
 *  Получаем набор лотов для пополнения баланса
 *
 *  @param socket, options, callback
 *  @return {Object} - объект со списом лотов
 */

const Config      = require('./../../../../config.json');
const constants   = require('./../../../constants');
const db          = require('./../../../db_manager');
const emitRes     = require('./../../../emit_result');
const CONST_TYPE  = Config.good_types.money;

module.exports = function (socket, options) {

  db.findAllGoods(CONST_TYPE, function (err, goods) {
    if (err) {  return emitRes(err, socket, constants.IO_GET_MONEY_SHOP); }
    
    emitRes(null, socket, constants.IO_GET_MONEY_SHOP, { [constants.PFIELDS.LOTS] : goods });
  });

};


