/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Назначаем обработчики для званий
 */

var constants = require('./../../../constants');

var handleRank  = require('./handle_rank'),
    handlePopular = require('./handle_popular_bonus');

module.exports = function (ranks) {
  
  ranks.setOnRank(handleRank);
  ranks.setOnRankBonus(constants.RANKS.POPULAR, handlePopular);
  
};