/**
 * Created by s.t.o.k.a.t.o on 26.01.2017.
 *
 * Назначаем рандомом цены для разных групп товара
 */

const logger  = require('../../lib/log')(module);
const Config  = require('./../../config.json');
const dbCtrlr = require('./../db_controller');
const PF      = require('../const_fields');

const CONST_TYPE = Config.good_types.gift;

const groups = {
  loves       : { min : 1, max : 2 },
  breath      : { min : 1, max : 2 },
  flowers     : { min : 1, max : 2 },
  drinks      : { min : 1, max : 2 },
  common      : { min : 1, max : 2 },
  flirtation  : { min : 1, max : 2 },
  merry       : { min : 1, max : 2 },
  hats        : { min : 2, max : 3 },
  ranks       : { min : 1, max : 2 },
  to_avatar   : { min : 1, max : 2 },
  with_text   : { min : 1, max : 2 },
};

module.exports = function (callback) {
  dbCtrlr.findAllGoods(CONST_TYPE, (err, gifts) => {
    if(err) {
      logger.error('getCoins:');
      logger.error(err);
      return next(err);
    }
    
    let giftsLen = gifts.length;
    
    if(giftsLen == 0) {
      logger.info('randomGiftPrices');
      logger.info('no gifts in db');
      return callback(null, null);
    }
    
    setPriceIter(0, callback);
    
    //----------------------------------------------
    function setPriceIter(index, callback) {
      let gift = gifts[index];
      
      let randSettings = groups[gift[PF.GROUP]];
      if(!groups[gift[PF.GROUP]]) {
        return iterNext();
      }
        
      let price = randomInteger(randSettings.min, randSettings.max);
      
      let params = {
        [PF.ID] : gift[PF.ID],
        [PF.PRICE] : price
      };
      
      dbCtrlr.updateGood(params, (err) => {
        if(err) {
          logger.error('randomGiftPrices');
          logger.error(err);
          return callback(err, null);
        }
        
        iterNext();
      });
      
      //-----------------------------
      function iterNext() {
        index++;
  
        if(index < giftsLen) {
          setPriceIter(index, callback);
        } else {
          logger.info('randomGiftPrices');
          logger.info('done');
          callback(null, null);
        }
      }
    }
  
    function randomInteger(min, max) {
      let rand = min + Math.random() * (max + 1 - min);
      rand = Math.floor(rand);
      return rand;
    }
  });
};