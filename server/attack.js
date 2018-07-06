
var ruleset;
var content;
const logger = require("./logger.js");
const loader = require("./strategy_loader.js");
const contextCtor = require("./battle_action.js");

module.exports =
{
  init: function(rules)
  {
    ruleset = rules;
    content = contentModule;
  },

  //Designate a strategy to resolve this attack. The type of strategy is tied
  //to the filename of the strategy and the weapon type (they must thus be the same)
  resolve: function(actor, targetPosition, weaponSlots, map)
  {
    var context;

    if (Array.isArray(weapons) === false)
    {
      weapons = [weapons];
    }

    //all weapons are supposed to be of the same type, hence only checking the first
    //to decide on the strategy to use should be fine
    context = new contextCtor.BattleAction(actor, targetPosition, weaponSlots, weaponSlots[0].equipped.weaponType);

    if (loader.strategies[type] == null || loader.strategies[type].resolve == null)
    {
      logger.add("The strategy " + type + " does not exist or lacks a resolve() method.");
      return [];
    }

    loader.strategies[type].resolve(context, map, loader.subStrategies);
  }
};
