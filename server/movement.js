
var ruleset;
const logger = require("./logger.js");
const loader = require("./strategy_loader.js");
const contextCtor = require("./battle_action.js");

module.exports =
{
  init: function(rules)
  {
    ruleset = rules;
    return this;
  },

  resolve: function(actor, targetPosition, map)
  {
    var context;

    if (actor.hasProperty("flying") === true && loader.strategies["flying"] != null)
    {
      context = new contextCtor.BattleAction(actor, targetPosition, "flying", "movement");
      return loader.strategies["flying"].resolve(context, map, loader.subStrategies);
    }

    else if (actor.hasProperty("trample") === true && loader.strategies["trample"] != null)
    {
      context = new contextCtor.BattleAction(actor, targetPosition, "trample", "movement");
      return loader.strategies["trample"].resolve(context, map, loader.subStrategies);
    }

    else
    {
      context = new contextCtor.BattleAction(actor, targetPosition, "defaultMovement", "movement");
      return loader.strategies["defaultMovement"].resolve(context, map, loader.subStrategies);
    }
  }
}
