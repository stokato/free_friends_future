/**
 *  Получаем набор лотов для пополнения баланса
 *
 *  @param socket, options, callback
 *  @return {Object} - объект со списом лотов
 */

const Config      = require('./../../../../config.json');
const PF          = require('./../../../const_fields');
const db          = require('./../../../db_manager');
const emitRes     = require('./../../../emit_result');

module.exports = function (socket, options) {

  db.findAllCoins((err, goods) => {
    if (err) {
      return emitRes(err, socket, Config.io.emits.IO_GET_MONEY_SHOP);
    }
    
    emitRes(null, socket, Config.io.emits.IO_GET_MONEY_SHOP, { [PF.LOTS] : goods });
  });

};


