
const event = require("./server/emitter.js");
var keys;
var ruleset;
var interpreter;
var battleExpireTime = 1190000;	//after this amount of time a challenge will expire.
var challengeExpireTime = 59000;	//after this amount of time a challenge will expire.

var postRoundLimit = 20;

const WIDTH = 25;
const HEIGHT = 25;


var dmgXPRate = 100;
var lifeXPRate = 85;
var dmgXPCap = 1;
var xpAdjCons = 10;
var xpAdjMult = 0.5;
var xpAdjHighCap = 2.5;
var xpAdjLowCap = 0.25;
var xpAdjLvlMult = 1.05;

module.exports =
{
  list: {},

  init: function(index)
  {
    keys = index;
    ruleset = require("./server/ruleset.js").init(index);
    interpreter = require("./server/battle_interpreter.js").init(index);
    return this;
  }

  create: function(players)
  {
    var b = {};

    //FUNCTIONS
    b.verifyDeployment = verifyDeployment;
    b.verifyOwner = verifyOwner;
    b.verifyMovement = verifyMovement;
    b.verifyAttack = verifyAttack;
    b.verifyMeleeAction = verifyMeleeAction;
    b.verifyRangedAction = verifyRangedAction;
    b.verifySpellAction = verifySpellAction;
    b.resolveAttack = resolveAttack;
    b.startPack = startPack;
    b.emitAll = emitAll;
    b.generateMap = generateMap;
    b.readyActors = readyActors;
    b.getTurnOrder = getTurnOrder;
    b.verifyMovement = verifyMovement;

    //PROPERTIES
    b.positions = [[]];
    b.actors = [];
    b.players = players;
    b.deployedPlayers = 0;
    b.width = WIDTH;
    b.height = HEIGHT;
    b.map = b.generateMap();
    b.order = b.getTurnOrder(12);

    //INIT
    for (var i = 0; i < b.players.length; i++)
    {
      //STORING THE BATTLE UNDER EACH PLAYER'S USERNAME
      this.list[b.players[i].username] = b;

      for (var j = 0; j < b.players[i].characters.length; j++)
      {
        b.actors.push(b.players[i].characters[j]);
      }

      b.players[i].socket.emit("deploymentPhase", {size: [b.map.length, b.map[0].length]});
      b.players[i].socket.on("deploymentScheme", function(data)
      {
        b.verifyDeployment(b.players[i], data);

        if (b.deployedPlayers >= b.players.length)
        {
          //battle start!
          b.emitAll("battleStart", {order: b.order, positions: b.positions});
          b.listenAll("movement", function(data, socket)
          {
            b.resolveMovement(data, socket);
          });

          b.listenAll("attack", function(data, socket)
          {
            b.resolveAttack(data, socket);
          });

          b.listenAll("endTurn", function(data, socket)
          {
            b.endTurn(data, socket);
          });
        }
      });
    }

    b.readyActors();
  }
}

function verifyDeployment(player, characters)
{
  if (characters.length < player.characters.length)
  {
    player.socket.emit("deploymentFailed", "You need to deploy all of your characters.");
    return;
  }

  for (var i = 0; i < characters.length; i++)
  {
    if (i === 0 && characters[i].position.x > 2)
    {
      player.socket.emit("deploymentFailed", "You can only place your characters in a tile within the top three rows.");
      return;
    }

    else if (i === 1 && characters[i].position.x < WIDTH - 2)
    {
      player.socket.emit("deploymentFailed", "You can only place your characters in a tile within the bottom three rows.");
      return;
    }

    player.characters[characters[i].id].battle.position = characters[i].position;
    this.positions[characters[i].position.x][characters[i].position.y] = player.characters[characters[i].id].functionless();
  }

  this.deployedPlayers++;
};

function distance(pos1, pos2)
{
  var dist1 = Math.abs(pos1[0] - pos2[0]);
  var dist2 = Math.abs(pos1[1] - pos2[1]);

  if (dist1 > dist2)
  {
    return dist1;
  }

  else return dist2;
}

function verifyOwner(data, socket)
{
  if (data.character.id != this.order[0].actor.id)
  {
    //wrong turn
    throw new Error("It is not this character's turn to act.");
  }

  if (data.username == null || this.players[data.username] == null)
  {
    //wrong username
    throw new Error("This isn't a valid player for you to control.");
  }

  if (this.players[data.username].characters[data.character.id] == null)
  {
    //wrong character
    throw new Error("This isn't a valid character for you to control.");
  }
}

function resolveMovement(data, socket)
{
  try
  {
    this.verifyMovement(data, socket);
    this.players[data.username].characters[data.character.id] = data.character.position;
    socket.emit("ResolvedMovement", {character: data.character.id, position: data.character.position});
  }

  catch(err)
  {
    socket.emit("InvalidMovement", err);
  }
}

function verifyMovement(data, socket)
{
  var serverChar;

  try
  {
    this.verifyOwner(data, socket);

    if (data.character.position.x > b.width || data.character.position.x > b.height)
    {
      //moved out of bounds
      throw new Error("A character cannot move outside the battle space.");
    }

    if (distance(serverChar.battle.position, data.character.position) > serverChar[keys.MP])
    {
      //too much movement
      throw new Error("This character cannot move this far.");
    }
  }

  catch(err)
  {
    throw err;
  }
}

function resolveAttack(data, socket)
{
  try
  {
    var verifiedPack = this.verifyAttack(data, socket);
    var resolvedPack = ruleset.resolveAttack(verifiedPack);
    var translatedPack = interpreter.translateResults(resolvedPack);
    socket.emit("ResolvedAttack", translatePack);
  }

  catch(err)
  {
    socket.emit("InvalidAttack", err);
  }
}

function verifyAttack(data, socket)
{
  var actionFunctions = {};

  try
  {
    this.verifyOwner(data, socket);

    if (this.actors.filter(function(char) {  return char.id == data.target.id;  }).length <= 0)
    {
      //wrong target
      throw new Error("The target does not exist.");
    }

    if (this.order[0].actor[keys.PLAYER] == data.target.player)
    {
      //wrong target (friendly)
      throw new Error("You cannot target one of your own characters.");
    }

    if (data.action === keys.TRIGGERS.MELEE)
    {
      return this.verifyMeleeAction(data, socket);
    }

    else if (data.action === keys.TRIGGERS.RANGED)
    {
      return this.verifyRangedAction(data, socket);
    }

    else if (data.action === keys.TRIGGERS.SPELL)
    {
      return this.verifySpellAction(data, socket);
    }

    else throw new Error("The attack does not seem to be a melee, ranged or spell one.");
  }

  catch(err)
  {
    throw err;
  }
}

function verifyMeleeAction(data, socket)
{
  var actor = this.players[data.username].characters[data.character.id];
  var target = this.players[data.target.player].characters[data.target.id];
  var distance = distance(serverChar.battle.position, data.character.position);
  var filter = filterWeapons(data.weapons, actor, target, distance);
  var reqAPs;

  if (filter.accepted.length <= 0)
  {
    throw new Error("None of the weapons can reach, affect or harm this target.");
  }

  reqAPs = requiredAPs(filter.accepted, actor);

  if (actor.battle[keys.AP] < reqAPs)
  {
    throw new Error("Not enough APs to make these attacks. The total AP cost is " + reqAPs + ", but this character only has " + actor.battle[keys.AP] + " left.");
  }

  return {"type": keys.TRIGGERS.MELEE, "actor": actor, "target": target, "distance": distance, weapons: filter, data: {}};
}

function verifyRangedAction(data)
{
  actor = this.players[data.username].characters[data.character.id];
  target = this.players[data.target.player].characters[data.target.id];
  weapons = actor.battle.equippedWpns.filter(function(wpn)
  {
    return wpn[keys.RANGE] >= distance(serverChar.battle.position, data.character.position);
  });

  if (weapons.length <= 0)
  {
    //no equipped weapon has enough range
    socket.emit("InvalidRange", "No equipped weapon has enough range to hit this target.");
    return;
  }

  weapons = weapons.filter(function(wpn)
  {
    return wpn[keys.CAT_LIST].includes(keys.CAT.RANGED) === true;
  });

  if (weapons.length <= 0)
  {
    //no equipped weapon has enough range
    socket.emit("InvalidType", "No equipped weapon is a ranged weapon.");
    return;
  }

  //TODO verify immunities (req_life attacks against lifeless, etc.)

  //resolve attack here calling upon the ruleset
  ruleset.ranged(data.character, data.target, weapons);
}

function endTurn(data, socket)
{
  var actor = this.players[data.username].characters[data.character.id];

  
}

function requiredAPs(weapons, actor)
{
  var apCost = 0;
  var weaponIDs = [];

  for (var i = 0; i < weapons.length; i++)
  {
    var timesAvailable = actor.getAttacks(weapons[i][keys.ID]).length;
    var timesUsed = weaponIDs.filter(function(id) { return id === weapons[i][keys.ID]; }).length;
    apCost += weapons[i][keys.AP_COST];

    if (weaponIDs.length > 0 && timesUsed > 1 && timesUsed < timesAvailable)
    {
      //combos, each *new* *unique* attack in the same sequence reduces its cost by 1
      //check the number of this attack available in the character and compare
      //it to the number of times it's been already used in the weaponIDs
      apCost--;
    }

    weaponIDs.push(weapons[i][keys.ID]);
  }

  return apCost;
}

function filterWeapons(weapons, actor, target, distance)
{
  var verified = [];
  var rejected = [];

  for (var i = 0; i < weapons.length; i++)
  {
    var attacks = actor.getAttacks(weapons[i]);

    if (attacks == null || attacks.length < 1)
    {
      rejected.push({weapon: weapons[i], reason: "This weapon id is not valid."});
      continue;
    }

    verified.push(attacks[0]);
  }

  verified = verified.filter(function(wpn)
  {
    if (wpn[keys.RANGE] < distance)
    {
      rejected.push({weapon: wpn[keys.NAME], reason: "This weapon does not have enough range to hit this target."});
    }

    else return wpn;
  });

  verified = verified.filter(function(wpn)
  {
    if (wpn[keys.CAT_LIST].includes(keys.CAT.MELEE) === false)
    {
      rejected.push({weapon: wpn[keys.NAME], reason: "This weapon is a melee weapon."});
    }

    else return wpn;
  });

  verified = verified.filter(function(wpn)
  {
    if (wpn[keys.PROP_LIST].includes([keys.PROPS.REQ.LIFE]) === true && target[keys.PROP_LIST].includes([keys.PROPS.LIFELESS]) === true)
    {
      rejected.push({weapon: wpn[keys.NAME], reason: "This weapon does not work against lifeless targets."});
    }

    else return wpn;
  });

  verified = verified.filter(function(wpn)
  {
    if (wpn[keys.PROP_LIST].includes([keys.PROPS.REQ.MIND]) === true && target[keys.PROP_LIST].includes([keys.PROPS.MINDLESS]) === true)
    {
      rejected.push({weapon: wpn[keys.NAME], reason: "This weapon does not work against mindless targets."});
    }

    else return wpn;
  });

  return {rejected: rejected, accepted: verified};
}

//TODO
function verifySpellAction(data)
{
  actor = this.players[data.username].characters[data.character.id];
  target = this.players[data.target.player].characters[data.target.id];
  spell;
}

function startPack()
{
  var obj = {order: this.order, positions: null};

  for (var )
}

function emitAll(trigger, data)
{
  for (var i = 0; i < this.players.length; i++)
  {
    this.players[i].socket.emit(trigger, data);
  }
};

function listenAll(trigger, fn)
{
  for (var i = 0; i < this.players.length; i++)
  {
    this.players[i].socket.on(trigger, function(data)
    {
      fn(data, this.players[i].socket);
    });
  }
}

function generateMap()
{
  var map = [];

  for (var i = 0; i < WIDTH; i++)
  {
    map.push([]);

    for (var j = 0; j < HEIGHT; j++)
    {
      map[i].push({terrain: null, actor: null, coordinates: [i, j]});
    }
  }

  return map;
}

function readyActors()
{
  for (var i = 0; i < this.actors.length; i++)
  {
    this.actors[i].battleReady();
  }
}

function getTurnOrder(turns)
{
  var order = [];
  var actorSpeeds = [];

  //create a virtual "current speed" meter and simulate several turns, to generate
  //the future order. The function returns an array of actors (the character objects)
  //in the proper turn order for a given length of turns. It does so by increasing
  //the current speed meter and then sorting the actorSpeeds array and grabbing the
  //resulting first one each turn, since that will be the faster actor.
  for (var i = 0; i < this.actors.length; i++)
  {
    actorSpeeds[i] = {"actor": this.actors[i], "speed": this.actors[i][keys.SPEED], "currSpeed": 0};
  }

  for (var i = 0; i < turns; i++)
  {
    for (var j = 0; j < this.actors.length; j++)
    {
      order.push(actorSpeeds.sort(function(a, b)
      {
        if (a.currSpeed == b.currSpeed && a.speed > b.speed)
        {
          return 1;
        }

        else if (a.currSpeed == b.currSpeed && a.speed > b.speed)
        {
          return -1;
        }

        else return a.currSpeed - b.currSpeed;
      })[0].actor);

      actorSpeeds[0].currSpeed += actorSpeeds[0].speed;
    }
  }

  return order;
}

function adjustXP(xpEarned, ownLvl, oppLvl)
{
	var multiplier = (((xpAdjMult * oppLvl) + xpAdjCons) / ((xpAdjMult * ((2 * ownLvl) - oppLvl)) + xpAdjCons)).lowerCap(xpAdjLowCap).cap(xpAdjHighCap);
	return Math.floor(xpEarned * multiplier); //* Math.pow(xpAdjLvlMult, ownLvl)
}

function calcXP(character, opponent, dmgDealt, dmgTaken)
{
  var maxHP = character.getTtlShapeHP();
  var maxOppHP = opponent.getTtlShapeHP();
  return (((dmgDealt.cap(maxOppHP) / maxOppHP) * dmgXPRate) + ((dmgTaken.cap(maxHP) / maxHP) * lifeXPRate));
}

function getWinner(t = this)
{
	if (t.challenger[ids.CURR_HP] <= 0 && t.offender[ids.CURR_HP] <= 0)
	{
		t.winner = 0;
		return "#####IT'S A DRAW!#####";
	}

	else if (t.challenger[ids.CURR_HP] <= 0)
	{
		t.winner = t.offender.id;
		return "#####" + t.offender.name + " IS VICTORIOUS!#####";
	}

	else if (t.offender[ids.CURR_HP] <= 0)
	{
		t.winner = t.challenger.id;
		return "#####" + t.challenger.name + " IS VICTORIOUS!#####";
	}

	else if (t.turnID == t.challenger.id)
	{
		t.winner = t.offender.id;
		return "#####" + t.offender.name + " IS VICTORIOUS!#####";
	}

	else if (t.turnID == t.offender.id)
	{
		t.winner = t.challenger.id;
		return "#####" + t.challenger.name + " IS VICTORIOUS!#####";
	}

	else
	{
		return "#####NO WINNER COULD BE DECIDED! IT'S A DRAW!#####";
	}
}
