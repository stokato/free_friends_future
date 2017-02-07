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

const ranks = [
  Config.ranks.dj.name,
  Config.ranks.generous.name,
  Config.ranks.lucky.name,
  Config.ranks.popular.name
];

module.exports = function (callback) {
  dbCtrlr.findAllGoods(CONST_TYPE, (err, gifts) => {
    if(err) {
      logger.error('getCoins:');
      logger.error(err);
      return next(err);
    }
    
    let giftsLen = gifts.length;
    
    if(giftsLen == 0) {
      logger.info('randomRankGifts');
      logger.info('no gifts in db');
      return callback(null, null);
    }
    
    setPriceIter(0, callback);
    
    //----------------------------------------------
    function setPriceIter(index, callback) {
      let gift = gifts[index];
      
      if(gift[PF.GROUP] != "ranks") {
        return iterNext();
      }
      
      let rand = randomInteger(0, ranks.length-1);
      let rank = ranks[rand];
      
      let params = {
        [PF.ID] : gift[PF.ID],
        [PF.RANK] : rank
      };
      
      dbCtrlr.updateGood(params, (err) => {
        if(err) {
          logger.error('randomRankGifts');
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
          logger.info('randomRankGifts');
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