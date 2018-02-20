
var keys;

//The area determines how big a chance it adds to it being hit,
//and the height is subtracted from the character's size to see
//if it's reachable by an attacker
var partSizes = {	[keys.PARTS.HEAD]: {area: 4, height: 0},
									[keys.PARTS.EYE]: {area: 1, height: 0},
									[keys.PARTS.BODY]: {area: 10, height: -1},
									[keys.PARTS.ARM]: {area: 4, height: -2},
									[keys.PARTS.LEG]: {area: 4, height: -6},
									[keys.PARTS.WING]: {area: 3, height: 0}	};

module.exports =
{
  init: function(index)
  {
    keys = index;
    return this;
  },

  apply: function(pack, result)
  {
    result.parry = pack.target.getTotalAttribute(keys.PARRY);
    result.dualPenalty = pack.actor.getDualPenalty();
  	result.harassmentPenalty = (pack.data.nbrAttacks - 1) * 2;
  	result.attackRoll = pack.actor.getTotalAttack(pack.data.currentWeapon) - result.dualPenalty + dice.DRN();
  	result.defenceRoll = pack.target.getTotalDefence() - result.harassmentPenalty + dice.DRN();
    result.difference = result.attackRoll - result.defenceRoll;
    result.hitLocation = getHitLocation(weapon[keys.LEN], pack.actor[keys.SIZE], pack.target[keys.PART_LIST]);
    pack.data.hitLocation = result.hitLocation;

		if (result.parry > 0 && pack.data.currentWeapon[keys.PROP_LIST].includes(keys.PROPS.FLAIL) === true)
		{
			result.difference += 2;
		}

		if (result.difference < 0)
		{
			result.failed = true;
			return;
		}

		else if (result.difference > 0 && result.difference - result.parry < 0)
		{
			result.isShieldHit = true;
      pack.data.isShieldHit = true;
		}

  	//TODO On Hit effect happens here
		if (pack.data.currentWeapon[keys.ON_HIT] != null && pack.data.currentWeapon[keys.ON_HIT].length > 0)
		{

		}
  }
}

function getHitLocation(weaponLength, actorSize, targetParts)
{
	var arr = [];
	var maxHeight = weaponLength + actor[keys.SIZE];

  for (var part in keys.PARTS)
  {
    var weight = partSizes[keys.PARTS[part]].area * targetParts[keys.PARTS[part]];

    for (var i = 0; i < weight; i++)
    {
      arr.push(part);
    }
  }

  return arr[Math.floor((Math.random() * arr.length))];
}
