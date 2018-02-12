
var keys;
var chanceMultiplier = 25;
var chanceCap = 33;
var severChance = chanceMultiplier * 0.75;
var recuperationChance = 25;
var healableAffl = {[ids.BATTLE_FRIGHT]: 1, [ids.CHEST_WOUND]: 1, [ids.DISEASED]: 1, [ids.DMGD_ARM()]: 1,
										[ids.DMGD_EYE()]: 1, [ids.DMGD_HEAD()]: 1, [ids.DMGD_WING()]: 1,
										[ids.LIMP]: 1, [ids.WEAKENED]: 1, [ids.TORN_WING()]: 1};

module.exports =
{
  init: function(index)
  {
    keys = index;
    return this;
  },

  apply: function(pack, result)
  {
    if (pack.data.canAfflict === false)
    {
      return;
    }

    var chance = Math.floor((pack.data.damage / Math.floor(t[ids.MAX_HP])) * chanceMultiplier).cap(chanceCap);
  	var roll = Math.floor((Math.random() * 100)) + 1;

  	/*if (hitLoc.includes(ids.HEAD))
  	{
  		var arr = [ids.MUTE, ids.DEMENTIA, ids.FEEBLEMINDED];
  		var nbr = Math.floor((Math.random() * arr.length));
  		t[ids.AFFL][arr[nbr]] = 1;
  		result += arr[nbr].capitalize() + ". ";
  	}

  	else*/ if (hitLoc.includes(ids.EYE))
  	{
  		result += ids.DMGD_EYE().capitalize() + ". ";
  		t[ids.AFFL][ids.DMGD_EYE()] = ++t[ids.AFFL][ids.DMGD_EYE()] || 1;
  	}

  	else if (hitLoc.includes(ids.ARM))
  	{
  		if (type == ids.SLASH && chance >= severChance)
  		{
  			loseSlot(ids.HANDS, t);
  			result += ids.DMGD_ARM().capitalize() + ". ";
  			t[ids.AFFL][ids.DMGD_ARM()] = ++t[ids.AFFL][ids.DMGD_ARM()] || 1;
  		}

  		else
  		{
  			result += ids.WEAKENED.capitalize() + ". ";
  			t[ids.AFFL][ids.WEAKENED] = 1;
  		}
  	}

  	/*else if (hitLoc.includes(ids.WING))
  	{
  		if (type == ids.SLASH && chance >= severChance)
  		{
  			result += ids.DMGD_WING().capitalize() + ". ";
  			t[ids.AFFL][ids.DMGD_WING()] = ++t[ids.AFFL][ids.DMGD_WING()] || 1;
  		}

  		else
  		{
  			result += ids.TORN_WING().capitalize() + ". ";
  			t[ids.AFFL][ids.TORN_WING()] = 1;
  		}
  	}*/

  	else if (hitLoc.includes(ids.LEG))
  	{
  		if (type == ids.SLASH && chance >= severChance || t[ids.AFFL][ids.LIMP])
  		{
  			result += ids.CRIPPLED.capitalize() + ". ";
  			delete t[ids.AFFL][ids.LIMP];
  			t[ids.AFFL][ids.CRIPPLED] = 1;
  		}

  		else
  		{
  			result += ids.LIMP.capitalize() + ". ";
  			t[ids.AFFL][ids.LIMP] = 1;
  		}
  	}

  	else if (hitLoc.includes(ids.BODY))
  	{
  		var arr = [ids.DISEASED, ids.CHEST_WOUND, ids.BATTLE_FRIGHT, ids.NEVER_HEAL_WOUND];
  		var nbr = Math.floor((Math.random() * arr.length));
  		t[ids.AFFL][arr[nbr]] = 1;
  		result += arr[nbr].capitalize() + ". ";
  	}

  	updateAfflictions(t);
  	return result;
  }
}
