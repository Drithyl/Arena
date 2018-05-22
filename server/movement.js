
var ruleset;
const logger = require("./logger.js");
const loader = require("./strategy_loader.js");

module.exports =
{
  init: function(rules)
  {
    ruleset = rules;
  },

  resolve: function(actor, targetPosition, map)
  {
    if (actor.hasProperty("flying") === true && loader.strategies["flying"] != null)
    {
      return loader.strategies["flying"].resolve(actor, targetPosition, map, ruleset, loader.subStrategies);
    }

    else if (actor.hasProperty("trample") === true && loader.strategies["trample"] != null)
    {
      return loader.strategies["trample"].resolve(actor, targetPosition, map, ruleset, loader.subStrategies);
    }

    else
    {
      return loader.strategies["defaultMovement"].resolve(actor, targetPosition, map, ruleset, loader.subStrategies);
    }
  }
}
