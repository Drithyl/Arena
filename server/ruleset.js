
const fs = require('fs');
const dice = require("./dice.js");
const order = require("./resolution_orders.json");
var strategies = [];
var keys;

var limbDmgCap = 0.5;
var counterThreshold = 5;

module.exports =
{
  init: function(index)
  {
    keys = index;

    for (var i = 0; i < order.attack.length; i++)
    {
      if (fs.existsSync("./server/strategies/" + order.attack[i] + ".js") === false)
      {
        continue;
      }

      strategies.push(require("./server/strategies/" + order.attack[i] + ".js").init(keys));
    }
  },

  resolveAttack: function(pack)
  {
    if (pack.type === keys.TRIGGERS.MELEE)
    {
      return melee(pack);
    }

    else if (pack.type === keys.TRIGGERS.RANGED)
    {
      return ranged(pack);
    }

    else if (pack.type === keys.TRIGGERS.SPELL)
    {
      return spell(pack);
    }

    else throw new Error("This attack seems to be neither melee, ranged nor a spell. This should have been verified by the previous function, check the code.");
  }
}

function melee(pack)
{
  var results = [];
  pack.data.nbrAttacks = 0;

  for (var i = 0; i < pack.weapons.accepted.length; i++)
  {
    results.push({});
    pack.data.nbrAttacks++;
    pack.data.currentWeapon = data.weapons.accepted[i];

    for (var j = 0; j < order.attack.length; j++)
    {
      strategies[j].apply(pack, results[i]);

      if (results[i].failed === true)
      {
        break;
      }
    }

    var encumbrance = pack.data.actor.getTotalEncumbrance();
    pack.data.actor.addFatigue(encumbrance);
    results.push({fatigue: encumbrance});
  }

  return results;
}
