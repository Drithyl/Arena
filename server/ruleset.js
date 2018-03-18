
const fs = require('fs');
const dice = require("./dice.js");
const order = require("./resolution_orders.json");
const events = require("/events_handler.js");
var meleeStrategies;
var turnEndStrategies;

module.exports =
{
  init: function()
  {
    meleeStrategies = loadStrategies(order.melee);
    turnEndStrategies = loadStrategies(order.turnEnd);
  },

  move: function(actor, map, targetPosition)
  {
    var distanceMoved = actor.battle.area.distance(targetPosition);

    if (distanceMoved > actor.mp)
    {
      //too much movement
      throw new Error("This character cannot move this far.");
    }

    if (distanceMoved % actor.stepSize() !== 0)
    {
      throw new Error("This character must move " + actor.stepSize() + " steps at a time.");
    }

    if (map.isOccupied(actor.battle.area, actor.id) === true)
    {
      throw new Error("This space is already occupied by another character.");
    }

    if (map.isOutOfBounds(actor.battle.area) === true)
    {
      throw new Error("You cannot move out of the boundaries of the battle map.");
    }

    actor.battle.mp -= distanceMoved;
    actor.battle.area.assignPosition(targetPosition.x, targetPosition.y);
    map.assignPosition(actor, actor.battle.area);
  },

  melee: function(actor, targetPosition, weapon, battle)
  {
    var verifiedPack;

    try
    {
      verifiedPack = verifyMelee(actor, targetPosition, weapon, battle);
      resolveMelee(verifiedPack);
    }

    catch(err)
    {
      throw err;
    }

    return verifiedPack.results;
  },

  ranged: function(actor, targetPosition, weapon, battle)
  {
    var verifiedPack;
    var result;

    try
    {
      verifiedPack = verifyRanged(actor, targetPosition, weapon, battle);
      result = resolveRanged(verifiedPack);
    }

    catch(err)
    {
      throw err;
    }

    return result;
  },

  endTurn: function(pack)
  {
    var results = [];

    for (var i = 0; i < turnEndStrategies.length; i++)
    {
      results.push({});
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
      apCost += weapons[i].apCost;

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

function verifyMelee(actor, targetPosition, weapons, battle)
{
  var distance = actor.battle.area.distance(target.battle.area);
  var target = battle.map.tiles[targetPosition.x][targetPosition.y].character;
  var verifiedWeapon = verifyMeleeWeapon(weapon, actor, target, distance);

  if (target == null)
  {
    throw new Error("The selected target is an empty tile.");
  }

  if (actor.player === target.player)
  {
    //wrong target (friendly)
    throw new Error("You cannot target one of your own characters.");
  }

  if (actor.battle.ap < weapon.apRequired)
  {
    throw new Error(`Not enough APs to make these attacks. The total AP cost is ${reqAPs}, but this character only has ${actor.battle.ap} left.`);
  }

  return {type: "melee", battle: battle, actor: actor, targetPosition: targetPosition, distance: distance, weapon: verifiedWeapon, results: {}, data: {}};
}

function verifyRanged(actor, targetPosition, weapon, battle)
{
  var distance = actor.battle.area.distance(target.battle.area);
  var verifiedWeapon = verifyRangedWeapon(weapon, actor, target, distance);
  var target = battle.map.tiles[targetPosition.x][targetPosition.y].character;

  if (target == null)
  {
    //wrong target
    throw new Error("The selected target is an empty tile.");
  }

  if (actor.player === target.player)
  {
    //wrong target (friendly)
    throw new Error("You cannot target one of your own characters.");
  }

  if (actor.battle.ap < weapon.apRequired)
  {
    throw new Error(`Not enough APs to make these attacks. The total AP cost is ${reqAPs}, but this character only has ${actor.battle.ap} left.`);
  }

  return {"type": "ranged", "battle": battle, "actor": actor, "targetPosition": targetPosition, "distance": distance, weapon: verifiedWeapon, data: {}};
}

function resolveMelee(pack)
{
  var aoe = area.AreaOfEffect(pack.targetPosition, pack.weapon.abilities.areaOfEffect || 0);
  var targets = pack.battle.map.getCharactersAt(aoe);

  for (var i = 0; i < targets.length; i++)
  {
    var result;

    if (pack.results[targets[i].id] == null)
    {
      pack.results[targets[i].id] = [];
    }

    pack.target = targets[i];
    result = resolveAttack(pack);
    pack.results[targets[i].id].push(result);

    //check onHit
    if (result.attack.success === true && pack.weapon.onHit != null)
    {
      resolveMelee({type: "onHit", battle: pack.battle, actor: pack.actor, targetPosition: pack.targetPosition,
                    distance: 0, weapon: pack.weapon.onHit, results: pack.results, data: pack.data});
    }

    //check onDamage
    if (result.damage.success === true && pack.weapon.onDamage != null)
    {
      resolveMelee({type: "onDamage", battle: pack.battle, actor: pack.actor, "targetPosition": pack.targetPosition,
                    distance: 0, weapon: pack.weapon.onDamage, results: pack.results, data: pack.data});
    }

    //cleave
    if (result.damage.success === true && pack.data.targetKO === true &&
        pack.data.finalDamage > pack.data.damageInflicted)
    {
      var cleaveTargets;

      if (pack.data.damageType === "pierce")
      {
        //if target is left or right

        //else if target is above or below
      }
    }
  }
}

function resolveAttack(pack)
{
  var result = {};

  for (var i = 0; i < meleeStrategies.length; i++)
  {
    result[order.melee[i]] = {};
    meleeStrategies[i].apply(pack, result[order.melee[i]]);

    if (result[order.melee[i]].targetKO === true)
    {
      pack.data.targetKO = true;
      pack.battle.koActors[pack.actor.player].push(pack.actor.id);
      break;
    }

    else if (result[order.melee[i]].success === false)
    {
      break;
    }
  }

  //check if fatigue was applied or if loop broke out before
  if (result.fatigue == null)
  {
    result.fatigue = {};
    meleeStrategies[order.melee.length - 1].apply(pack, result.fatigue);
  }

  return result;
}

function verifyMeleeWeapon(weapon, actor, target, distance)
{
  var verifiedWeapon = actor.getWeapon(weapon);

  if (verifiedWeapon == null)
  {
    throw new Error("The weapon id " + verifiedWeapon + " is not valid or equipped on this character.");
  }

  else if (verifiedWeapon.range < distance)
  {
    throw new Error("This weapon does not have enough range to hit this target.");
  }

  else if (verifiedWeapon.categories.includes("melee") === false)
  {
    throw new Error("This weapon is not a melee weapon.");
  }

  else if (verifiedWeapon.properties.includes("requiresLife") === true && target.properties.includes("lifeless") === true)
  {
    throw new Error("This weapon does not work against lifeless targets.");
  }

  else if (verifiedWeapon.properties.includes("requiresMind") === true && target.properties.includes("mindless") === true)
  {
    throw new Error("This weapon does not work against mindless targets.");
  }

  return verifiedWeapon;
}

function verifyRangedWeapon(weapon, actor, target, distance)
{
  var verifiedWeapon = actor.getWeapon(weapon);

  if (verifiedWeapon == null)
  {
    throw new Error("The weapon id " + weapon + " is not valid or equipped on this character.");
  }

  else if (verifiedWeapon.range < distance)
  {
    throw new Error("This weapon does not have enough range to hit this target.");
  }

  else if (verifiedWeapon.categories.includes("ranged") === false)
  {
    throw new Error("This weapon is not a ranged weapon.");
  }

  else if (verifiedWeapon.properties.includes("requiresLife") === true && target.properties.includes("lifeless") === true)
  {
    throw new Error("This weapon does not work against lifeless targets.");
  }

  else if (verifiedWeapon.properties.includes("requiresMind") === true && target.properties.includes("mindless") === true)
  {
    throw new Error("This weapon does not work against mindless targets.");
  }

  return verifiedWeapon;
}
