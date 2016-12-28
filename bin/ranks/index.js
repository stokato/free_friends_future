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
    onPopularBonus      = require('./lib/on_popular_bonus'),
    onNewRank           = require('./lib/on_new_rank'),
    onGetActiveRank     = require('./lib/on_get_active_rank'),
    onSetActiveRank     = require('./lib/on_set_active_rank');

function RanksManager() {
  // Обладатели званий
  this._rankOwners = {};
  
  // Накопленные бонусы по каждому званию
  this._bonuses = {};
  
  for(let item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    this._rankOwners[constants.RANKS[item]] = null;
    this._bonuses[constants.RANKS[item]] = 0;
  }
  
  // Список пользователей со счетчиками званий
  this._profiles = {};
  
  // Обработчик события писвоения звания
  this._onRank = null;
  
  // Обработчики для начисления бонусов по каждому званию
  this._onRankBonus = {
    [constants.RANKS.POPULAR] : onPopularBonus
  };
}

RanksManager.prototype.getRankOwner   = function (rank) { return this._rankOwners[rank]; };

RanksManager.prototype.addProfile           = addProfile;
RanksManager.prototype.deleteProfile        = deleteProfile;
RanksManager.prototype.addRankBall          = addRankBall;
RanksManager.prototype.awardProfile         = awardProfile;
RanksManager.prototype.takeBonus            = takeBonus;
RanksManager.prototype.onNewRank            = onNewRank;
RanksManager.prototype.onGetRanksOfProfile  = onGetRanksOfProfile;
RanksManager.prototype.onGetActiveRank      = onGetActiveRank;
RanksManager.prototype.onSetActiveRank      = onSetActiveRank;

module.exports = RanksManager;