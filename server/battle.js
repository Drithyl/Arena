
const event = require("./emitter.js");
const area = require("./area.js");
var sm;
var ruleset = require("./ruleset.js");
var interpreter = require("./battle_interpreter.js");
var playerModule;
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
  challenges: {},

  init: function(socketManager, playerModule)
  {
    sm = socketManager;
    playerModule = playerModule;
    listenToChallenges();
    return this;
  }
}

function listenToChallenges()
{
  sm.listenAll("challengeRequest", function(data, socket)
  {
    if (module.exports.list[socket.username] != null)
    {
      socket.emit("challengeRequestResponse", {success: false, challenger: socket.username, error: "You already have a battle ongoing."});
      return;
    }

    if (module.exports.list[data.target] != null)
    {
      socket.emit("challengeRequestResponse", {success: false, challenger: socket.username, error: "A battle is already ongoing for this user."});
      return;
    }

    if (module.exports.challenges[data.target] != null && module.exports.challenges[data.target][socket.username] != null)
    {
      socket.emit("challengeRequestResponse", {success: false, challenger: socket.username, error: "You already issued a challenge to this user."});
      return;
    }

    if (module.exports.challenges[data.target] == null)
    {
      module.exports.challenges[data.target] = {};

      if (module.exports.challenges[data.target].challengers == null)
      {
        module.exports.challenges[data.target].challengers = [];
      }
    }

    module.exports.challenges[data.target].challengers.push(socket.username);
    socket.emit("challengeRequestResponse", {success: true, challenger: socket.username, error: null});
  });

  sm.listenAll("challengeReply", function(data, socket)
  {
    if (module.exports.list[socket.username] != null)
    {
      socket.emit("challengeReplyResponse", {success: false, error: "You already have a battle ongoing."});
      return;
    }

    if (module.exports.challenges[socket.username] == null || module.exports.challenges[socket.username].includes(data.challenger) === false)
    {
      socket.emit("challengeReplyResponse", {success: false, error: "This challenge offer no longer exists."});
      return;
    }

    if (data.challengeAccepted === false)
    {
      sm.logged[challenger].emit("challengeReplyResponse", {success: false, error: null});
      return;
    }

    module.exports.challenges[socket.username].splice(module.exports.challenges[socket.username].indexOf(data.challenger), 1);
    sm.logged[data.challenger].emit("challengeReplyResponse", {success: true, error: null});
    createBattle([playerModule.online[data.challenger], playerModule.online[socket.username]]);
  });
}

/*
* Create a battle object and all of its functions and listeners. Arguments:
*
*   players         An array of the involved player objects (like:
*                   {username: "yadda", characters: {id1: character1, id2: character2, etc.}})
*/

function createBattle(players)
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
  b.emitBattleStartPacks = emitBattleStartPacks;
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
    module.exports.list[players[i].username] = b;
    b.koActors[players[i].username] = [];

    for (var j = 0; j < players[i].characters.length; j++)
    {
      b.actors.push(players[i].characters[j]);
    }

    sm.logged[players[i].username].emit("deploymentPhase", {size: {x: b.map.length, y: b.map[0].length}, area: b.deploymentAreas[players[i].username]});

    sm.listenMany(players, "deployment", function(data, socket)
    {
      b.verifyDeployment(playerModule.playerList[socket.username], data.characters);

      if (b.deployedPlayers >= b.players.length)
      {
        //battle start!
        b.emitBattleStartPacks();
        sm.listenMany(b.players, "movement", function(data, socket)
        {
          b.resolveMovement(data, socket);
        });

        sm.listenMany(b.players, "attack", function(data, socket)
        {
          b.resolveAttack(data, socket);
        });

        sm.listenMany(b.players, "endTurn", function(data, socket)
        {
          b.endTurn(data, socket);
        });
      }
    });

    sm.logged[players[i].username].on("deployment", function(data)
    {

    });
  }

  b.readyActors();
}

function verifyDeployment(player, characters)
{
  var area = this.deploymentAreas[player.username];

  if (characters.length < player.characters.length)
  {
    sm.logged[player.username].emit("deploymentResponse", {success: false, error: "You need to deploy all of your characters."});
    return;
  }

  for (var i = 0; i < characters.length; i++)
  {
    if (area.contains(characters[i].position) === false)
    {
      sm.logged[player.username].emit("deploymentResponse", {success: false, error: "You can only place your characters in a tile within x: (" + area.xStart + "," + area.xEnd + ") and y: (" + area.yStart + "," + area.yEnd + ")."});
      return;
    }

    else if (this.map[characters[i].position.x][characters[i].position.y].actor != null)
    {
      sm.logged[player.username].emit("deploymentResponse", {success: false, error: "You can't place more than one character in the same tile."});
      return;
    }

    player.characters[characters[i].id].battle.position = characters[i].position;
    this.positions[characters[i].id] = characters[i].position;
    this.map[characters[i].position.x][characters[i].position.y].actor = characters[i];
    sm.logged[player.username].emit("deploymentResponse", {success: true, error: null});
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
  if (data.character.id != this.order[0])
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

    if (area.distance(serverChar.battle.position, data.character.position) > serverChar.ap)
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

    if (this.order[0].actor.player == data.target.player)
    {
      //wrong target (friendly)
      throw new Error("You cannot target one of your own characters.");
    }

    if (data.action === "melee")
    {
      return this.verifyMeleeAction(data, socket);
    }

    else if (data.action === "ranged")
    {
      return this.verifyRangedAction(data, socket);
    }

    else if (data.action === "spell")
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

  if (actor.battle.ap < reqAPs)
  {
    throw new Error(`Not enough APs to make these attacks. The total AP cost is ${reqAPs}, but this character only has ${actor.battle.ap} left.`);
  }

  return {"type": "melee", "battle": this, "actor": actor, "target": target, "distance": distance, weapons: filter, data: {}};
}

function verifyRangedAction(data, socket)
{
  actor = this.players[data.username].characters[data.character.id];
  target = this.players[data.target.player].characters[data.target.id];
  weapons = actor.battle.equippedWpns.filter(function(wpn)
  {
    return wpn.range >= area.distance(serverChar.battle.position, data.character.position);
  });

  if (weapons.length <= 0)
  {
    //no equipped weapon has enough range
    socket.emit("InvalidRange", "No equipped weapon has enough range to hit this target.");
    return;
  }

  weapons = weapons.filter(function(wpn)
  {
    return wpn.categories.includes("Ranged") === true;
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
    if (wpn.range < distance)
    {
      rejected.push({weapon: wpn.name, reason: "This weapon does not have enough range to hit this target."});
    }

    else return wpn;
  });

  verified = verified.filter(function(wpn)
  {
    if (wpn.categories.includes("melee") === false)
    {
      rejected.push({weapon: wpn.name, reason: "This weapon is a melee weapon."});
    }

    else return wpn;
  });

  verified = verified.filter(function(wpn)
  {
    if (wpn.properties.includes("requiresLife") === true && target.properties.includes("lifeless") === true)
    {
      rejected.push({weapon: wpn.name, reason: "This weapon does not work against lifeless targets."});
    }

    else return wpn;
  });

  verified = verified.filter(function(wpn)
  {
    if (wpn.properties.includes("requiresMind") === true && target.properties.includes("mindless") === true)
    {
      rejected.push({weapon: wpn.name, reason: "This weapon does not work against mindless targets."});
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

function emitBattleStartPacks()
{
  for (var i = 0; i < this.players.length; i++)
  {
    var playerPacks = {};

    this.players.forEach(function(player, index)
    {
      if (this.players[i].username != player.username)
      {
        playerPacks[player.username] = {};

        for (var id in player.characters)
        {
          playerPacks[player.username][id] = player.characters[id].giveEnemyData();
        }
      }
    });

    sm.logged[this.players[i].username].emit("battleStart",
    {
      order: this.order,
      positions: this.positions,
      "playerPacks": playerPacks
    });
  }
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
    actorSpeeds[i] = {"actor": this.actors[i], "speed": this.actors[i].ap};
  }

  actorSpeeds = actorSpeed.sort(function(a, b)
  {
    if (b.ap === a.ap)
    {
      //random order if same AP
      return Math.floor(Math.random()*2) == 1 ? 1 : -1;
    }

    else return b.ap - a.ap;
  })

  for (var i = 0; i < turns; i++)
  {
    order.push(this.actors[index].id);
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
    actorSpeeds[i] = {"actor": this.actors[i], "speed": this.actors[i].speed, "currSpeed": 0};
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
