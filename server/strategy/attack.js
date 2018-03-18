
var counterThreshold = 5;

//The area determines how big a chance it adds to it being hit,
//and the height is subtracted from the character's size to see
//if it's reachable by an attacker
var partSizes = {	head: {area: 4, height: 0},
									eye: {area: 1, height: 0},
									body: {area: 10, height: -1},
									arm: {area: 4, height: -2},
									leg: {area: 4, height: -6},
									wing: {area: 3, height: 0}	};

module.exports =
{
  apply: function(pack, result)
  {
		result.success = false;
    result.parry = pack.target.getTotalAttribute("parry");
    result.dualPenalty = pack.actor.getDualPenalty();
  	result.attackRoll = dice.DRN() + pack.actor.getTotalAttack(pack.data.currentWeapon) - result.dualPenalty;
  	result.defenceRoll = dice.DRN() + pack.target.getTotalDefence() - pack.target.battle.status.harassment;
    result.difference = result.attackRoll - result.defenceRoll;
    result.hitLocation = getHitLocation(weapon.reach, pack.actor.size(), pack.target.parts);
    pack.data.hitLocation = result.hitLocation;
		result.isShieldHit = false;
		pack.data.isShieldHit = false;
		pack.target.battle.status.harassment++;

		if (result.parry > 0 && pack.data.currentWeapon.properties.includes("flail") === true)
		{
			result.difference += 2;
		}

		if (result.difference < 0)
		{
			return;
		}

		else if (result.difference > 0 && result.difference - result.parry < 0)
		{
			result.isShieldHit = true;
      pack.data.isShieldHit = true;
		}

		result.success = true;

  	//TODO On Hit effect happens here
		if (pack.data.currentWeapon.onHit != null && pack.data.currentWeapon.onHit.length > 0)
		{

		}
  }
}

function getHitLocation(weaponLength, actorSize, targetParts)
{
	var arr = [];
	var maxHeight = weaponLength + actor.size();

  for (var part in targetParts)
  {
    var weight = partSizes[part].area * targetParts[part];

    for (var i = 0; i < weight; i++)
    {
      arr.push(part);
    }
  }

  return arr[Math.floor((Math.random() * arr.length))];
}
