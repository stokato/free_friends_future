/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Контроллер рангов пользователей одной комнаты
 *
 */

const constants = require('./../constants');

const addProfile        = require('./lib/add_profile'),
    deleteProfile       = require('./lib/delete_profile'),
    addRankBall         = require('./lib/add_rank_ball'),
    onGetRanksOfProfile = require('./lib/on_get_ranks_of_profile'),
    awardProfile        = require('./lib/award_profile'),
    takeBonus           = require('./lib/take_bonus'),
    emitAddBall         = require('./lib/emit_add_ball'),
    onPopularBonus      = require('./lib/on_popular_bonus'),
    onReleaserBonus     = require('./lib/on_releaser_bonus'),
    onNewRank           = require('./lib/on_new_rank'),
    onGetActiveRank     = require('./lib/on_get_active_rank'),
    onSetActiveRank     = require('./lib/on_set_active_rank'),
    addEmits            = require('./lib/add_emits'),
    deleteEmits         = require('./lib/delete_emits'),
    checkAlmgihty       = require('./lib/check_almighty');

function RanksManager() {
  // Обладатели званий
  this._rRankOwners = {};
  
  // Накопленные бонусы по каждому званию
  this._rBonuses = {};
  
  for(let item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    this._rRankOwners[constants.RANKS[item]] = null;
    this._rBonuses[constants.RANKS[item]] = 0;
  }

  this._rRankOwners[constants.ALMIGHTY] = null;
  
  // Список пользователей со счетчиками званий
  this._rProfiles = {};
  
  // Обработчики для начисления бонусов по каждому званию
  this._onRankBonus = {
    [constants.RANKS.POPULAR] : onPopularBonus,
    [constants.RANKS.RELEASER] : onReleaserBonus
  };

}

RanksManager.prototype.getRankOwner   = function (rank) { return this._rRankOwners[rank]; };

RanksManager.prototype.addProfile           = addProfile;
RanksManager.prototype.deleteProfile        = deleteProfile;
RanksManager.prototype.addRankBall          = addRankBall;
RanksManager.prototype.awardProfile         = awardProfile;
RanksManager.prototype.takeBonus            = takeBonus;
RanksManager.prototype.onNewRank            = onNewRank;
RanksManager.prototype.onGetRanksOfProfile  = onGetRanksOfProfile;
RanksManager.prototype.onGetActiveRank      = onGetActiveRank;
RanksManager.prototype.onSetActiveRank      = onSetActiveRank;
RanksManager.prototype.emitAddBall          = emitAddBall;
RanksManager.prototype.addEmits             = addEmits;
RanksManager.prototype.deleteEmits          = deleteEmits;
RanksManager.prototype.checkAlmighty        = checkAlmgihty;

module.exports = RanksManager;