
const event = require("./emitter.js");
const area = require("./area.js");
var sm;
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

  init: function(socketManager, index)
  {
    sm = socketManager;
    keys = index;
    ruleset = require("./server/ruleset.js").init(index);
    interpreter = require("./server/battle_interpreter.js").init(index);
    return this;
  }

  /*
  * Create a battle object and all of its functions and listeners. Arguments:
  *
  *   players         An array of the involved player objects (like:
  *                   {username: "yadda", characters: []})
  */

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
    b.readyActors = readyActors;
    b.getAPTurnOrder = getAPTurnOrder;
    b.verifyMovement = verifyMovement;
    b.endTurn = endTurn;
    b.endBattle = endBattle;

    //PROPERTIES
    b.positions = [[]];
    b.actors = [];
    b.players = players;
    b.koActors = {};
    b.deployedPlayers = 0;
    b.deploymentAreas = assignDeploymentAreas(players[0], players[1]);
    b.width = WIDTH;
    b.height = HEIGHT;
    b.turn = 1;
    b.round = 1;
    b.map = area.map(WIDTH, HEIGHT);
    b.order = b.getAPTurnOrder(20);

    //INIT
    for (var i = 0; i < players.length; i++)
    {
      //STORING THE BATTLE UNDER EACH PLAYER'S USERNAME
      this.list[players[i].username] = b;
      this.koActors[players[i].username] = [];

      for (var j = 0; j < players[i].characters.length; j++)
      {
        b.actors.push(players[i].characters[j]);
      }

      sm.logged[players[i].username].emit("deploymentPhase", {size: [b.map.length, b.map[0].length]});
      sm.logged[players[i].username].on("deploymentScheme", function(data)
      {
        b.verifyDeployment(players[i], data);

        if (b.deployedPlayers >= players.length)
        {
          //battle start!
          sm.emitMany("battleStart", {order: b.order, positions: b.positions});
          sm.listenMany(players, "movement", function(data, socket)
          {
            b.resolveMovement(data, socket);
          });

          sm.listenMany(players, "attack", function(data, socket)
          {
            b.resolveAttack(data, socket);
          });

          sm.listenMany(players, "endTurn", function(data, socket)
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
  var area = this.deploymentAreas[player.username];

  if (characters.length < player.characters.length)
  {
    sm.logged[player.username].emit("deploymentFailed", "You need to deploy all of your characters.");
    return;
  }

  for (var i = 0; i < characters.length; i++)
  {
    if (area.contains(characters[i].position) === false)
    {
      sm.logged[player.username].emit("deploymentFailed", "You can only place your characters in a tile within x: (" + area.x1 + "," + area.x2 + ") and y: (" + area.y1 + "," + area.y2 + ").");
      return;
    }

    else if (this.map[characters[i].position.x][characters[i].position.y].actor != null)
    {
      sm.logged[player.username].emit("deploymentFailed", "You can't place more than one character in the same tile.");
      return;
    }

    player.characters[characters[i].id].battle.position = characters[i].position;
    this.positions[characters[i].id] = characters[i].position;
    this.map[characters[i].position.x][characters[i].position.y].actor = characters[i];
  }

  this.deployedPlayers++;
}

function assignDeploymentAreas(p1, p2)
{
  var obj = {};
  obj[p1.username] = area.create(0, WIDTH, 0, 2);
  obj[p2.username] = area.create(0, WIDTH, HEIGHT - 2, HEIGHT);
  return obj;
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

  if (this.koActors[data.username].includes(data.character.id) === true)
  {
    //KOed character
    throw new Error("This character is knocked out.");
  }
}

function resolveMovement(data, socket)
{
  try
  {
    this.verifyMovement(data, socket);

    //delete old position
    delete this.map[data.character.position.x][data.character.position.y].actor;

    //store new position
    this.positions[data.character.id] = data.character.position;
    this.map[data.character.position.x][data.character.position.y].actor = this.players[data.username].characters[data.character.id];
    socket.emit("ResolvedMovement", {actor: data.character.id, position: data.character.position});
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

    if (area.distance(serverChar.battle.position, data.character.position) > serverChar[keys.MP])
    {
      //too much movement
      throw new Error("This character cannot move this far.");
    }

    if (this.map[data.character.position.x][data.character.position.y].actor != null)
    {
      throw new Error("This space is already occupied by another character.");
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
    var translatedPack = interpreter.translateAttack(resolvedPack);
    socket.emit("ResolvedAttack", translatedPack);
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
  var distance = area.distance(serverChar.battle.position, data.character.position);
  var filter = filterWeapons(data.weapons, actor, target, distance);
  var reqAPs;

  if (filter.accepted.length <= 0)
  {
    throw new Error("None of the weapons can reach, affect or harm this target.");
  }

  reqAPs = ruleset.calculateRequiredAPs(filter.accepted, actor);

  if (actor.battle[keys.AP] < reqAPs)
  {
    throw new Error("Not enough APs to make these attacks. The total AP cost is " + reqAPs + ", but this character only has " + actor.battle[keys.AP] + " left.");
  }

  return {"type": keys.TRIGGERS.MELEE, "battle": this, "actor": actor, "target": target, "distance": distance, weapons: filter, data: {}};
}

function verifyRangedAction(data, socket)
{
  actor = this.players[data.username].characters[data.character.id];
  target = this.players[data.target.player].characters[data.target.id];
  weapons = actor.battle.equippedWpns.filter(function(wpn)
  {
    return wpn[keys.RANGE] >= area.distance(serverChar.battle.position, data.character.position);
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
  var pack = {"actor": actor, battle: this, characters: this.actors, "map": this.map, data: {}};
  var resolvedPack = ruleset.endTurn(pack);

  for (var i = 0; i < this.players; i++)
  {
    var player = this.players[i];

    if (this.koActors[player.username].length >= player.characters.length)
    {
      //battle ends
      this.endBattle();
      return;
    }
  }

  this.turn++;

  if (this.turn % this.actors.length === 0)
  {
    this.round++;
  }

  this.order.shift();
  socket.emit("startTurn", this.order);
}

function endBattle()
{
  //TODO
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
function verifySpellAction(data, socket)
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

function readyActors()
{
  for (var i = 0; i < this.actors.length; i++)
  {
    this.actors[i].battleReady();
  }
}

function getAPTurnOrder(turns)
{
  var order = [];
  var actorSpeeds = [];
  var index = 0;

  for (var i = 0; i < this.actors.length; i++)
  {
    actorSpeeds[i] = {"actor": this.actors[i], "speed": this.actors[i][keys.AP]};
  }

  actorSpeeds = actorSpeed.sort(function(a, b)
  {
    if (b[keys.AP] === a[keys.AP])
    {
      //random order if same AP
      return Math.floor(Math.random()*2) == 1 ? 1 : -1;
    }

    else return b[keys.AP] - a[keys.AP];
  })

  for (var i = 0; i < turns; i++)
  {
    order.push(this.actors[index]);
    ++index.wrap(this.actors.length - 1);
  }

  return order;
}

function getTickTurnOrder(turns)
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
