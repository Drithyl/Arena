
const fs = require('fs');
const dice = require("./dice.js");
const order = require("./resolution_orders.json");
var meleeStrategies;
var turnEndStrategies;

module.exports =
{
  init: function()
  {
    meleeStrategies = loadStrategies(order.melee);
    turnEndStrategies = loadStrategies(order.turnEnd);
  },

  resolveAttack: function(pack)
  {
    if (pack.type === "melee")
    {
      return melee(pack);
    }

    else if (pack.type === "ranged")
    {
      return ranged(pack);
    }

    else if (pack.type === "spell")
    {
      return spell(pack);
    }

    else throw new Error("This attack seems to be neither melee, ranged nor a spell. This should have been verified by the previous function, check the code.");
  },

  endTurn: function(pack)
  {
    var results = [];

    for (var i = 0; i < turnEndStrategies.length; i++)
    {
      results.push({strategy: order.turnEnd[i]});
      turnEndStrategies[i].apply(pack, results[i]);
    }

    return results;
  },

  calculateRequiredAPs: function(weapons, actor)
  {
    var apCost = 0;
    var weaponIDs = [];

    for (var i = 0; i < weapons.length; i++)
    {
      var timesAvailable = actor.weaponTimesAvailable(weapons[i].id);
      var timesUsed = weaponIDs.filter(function(id) { return id === weapons[i].id; }).length;
      apCost += weapons[i].ap;

      if (weaponIDs.length > 0 && timesUsed > 1 && timesUsed < timesAvailable)
      {
        //combos, each *new* *unique* attack in the same sequence reduces its cost by 1
        //check the number of this attack available in the character and compare
        //it to the number of times it's been already used in the weaponIDs
        apCost--;
      }

      weaponIDs.push(weapons[i].id);
    }

    return apCost;
  }
}

function loadStrategies(orderList)
{
  var arr = [];

  for (var i = 0; i < orderList.length; i++)
  {
    if (fs.existsSync("./server/strategies/" + orderList[i] + ".js") === false)
    {
      continue;
    }

    arr.push(require("./server/strategies/" + orderList[i] + ".js"));
  }

  return arr;
}

function melee(pack)
{
  var results = [];
  pack.data.nbrAttacks = 0;

  for (var i = 0; i < pack.weapons.accepted.length; i++)
  {
    results.push([]);
    pack.data.nbrAttacks++;
    pack.data.currentWeapon = data.weapons.accepted[i];

    for (var j = 0; j < meleeStrategies.length; j++)
    {
      results[i].push({strategy: order.melee[j]});
      meleeStrategies[j].apply(pack, results[i][j]);

      if (results[i][j].targetKO === true)
      {
        //apply fatigue, the last strategy, before completely breaking out of the
        //loop
        results[i][j+1] = {strategy: order.melee[order.melee.length - 1]};
        meleeStrategies[order.melee.length - 1].apply(pack, results[i][j]);
        pack.battle.koActors[pack.actor.player].push(pack.actor.id);
        return results;
      }

      else if (results[i][j].failed === true)
      {
        //apply fatigue, the last strategy, before completely breaking out of the
        //loop
        results[i][j+1] = {strategy: order.melee[order.melee.length - 1]};
        meleeStrategies[order.melee.length - 1].apply(pack, results[i][j]);
        break;
      }
    }
  }

  return results;
}
