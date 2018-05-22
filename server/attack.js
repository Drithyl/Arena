
var ruleset;
const logger = require("./logger.js");
const loader = require("./strategy_loader.js");

module.exports =
{
  init: function(rules)
  {
    ruleset = rules;
  },

  //Designate a strategy to resolve this attack. The type of strategy is tied
  //to the filename of the strategy and the weapon type (they must thus be the same)
  resolve: function(actor, targetPosition, weapons, map)
  {
    //all weapons are supposed to be of the same type, hence only checking the first
    //to decide on the strategy to use should be fine
    var type = weapons[0].weaponType;

    if (loader.strategies[type] == null || loader.strategies[type].resolve == null)
    {
      logger.add("The strategy " + type + " does not exist or lacks a resolve() method.");
      return [];
    }

    strategies[type].resolve(actor, targetPosition, weapons, map, ruleset, loader.subStrategies);
  }
};
