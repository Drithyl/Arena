
const area = require("./area.js");
const map = require("./map.js");
var sm;
var ruleset = require("./ruleset.js");
var interpreter = require("./battle_interpreter.js");
var playerModule;

const WIDTH = 120;
const HEIGHT = 120;

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
    create([playerModule.online[data.challenger], playerModule.online[socket.username]]);
  });
}

/*
* Create a battle object and all of its functions and listeners. Arguments:
*
*   players         An array of the involved player objects (like:
*                   {username: "yadda", characters: {id1: character1, id2: character2, etc.}})
*/

function create(players)
{
  this.positions = {};
  this.characters = [];
  this.players = players;
  this.koCharacters = {};
  this.deployedPlayers = 0;
  this.deploymentAreas = assignDeploymentAreas(players[0], players[1]);
  this.turn = 1;
  this.round = 1;
  this.map = map.create(WIDTH, HEIGHT);
  this.order = this.getAPTurnOrder(20);

  //INIT
  for (var i = 0; i < players.length; i++)
  {
    //STORING THE BATTLE UNDER EACH PLAYER'S USERNAME
    module.exports.list[players[i].username] = b;
    this.koCharacters[players[i].username] = [];

    for (var j = 0; j < players[i].characters.length; j++)
    {
      this.characters.push(players[i].characters[j]);
    }

    sm.logged[players[i].username].emit("deploymentPhase", {size: {x: this.map.length, y: this.map[0].length}, area: this.deploymentAreas[players[i].username]});

    sm.listenMany(players, "deployment", function(data, socket)
    {
      this.verifyDeployment(playerModule.playerList[socket.username], data.characters);

      if (this.deployedPlayers >= this.players.length)
      {
        //battle start!
        this.emitBattleStartPacks();
        sm.listenMany(this.players, "movement", function(data, socket)
        {
          this.processMovement(data, socket);
        });

        sm.listenMany(this.players, "attack", function(data, socket)
        {
          if (data.action === "melee")
          {
            this.processMelee(data);
          }

          else if (data.action === "ranged")
          {
            this.processRanged(data);
          }

          else if (data.action === "spell")
          {
            this.processSpell(data);
          }
        });

        sm.listenMany(this.players, "endTurn", function(data, socket)
        {
          this.processEndTurn(data, socket);
        });
      }
    });
  }

  this.readyCharacters();
}

create.prototype.verifyDeployment = function(player, characters)
{
  var deploymentArea = this.deploymentAreas[player.username];

  if (characters.length < player.characters.length)
  {
    sm.logged[player.username].emit("deploymentResponse", {success: false, error: "You need to deploy all of your characters."});
    return;
  }

  for (var i = 0; i < characters.length; i++)
  {
    var character = player.characters[characters[i].id];
    character.area.setPosition(characters[i].position);

    if (deploymentArea.containsArea(character.area) === false)
    {
      sm.logged[player.username].emit("deploymentResponse", {success: false, error: "You can only place your characters in a tile within x: (" + deploymentArea.x + "," + (deploymentArea.width + deploymentArea.x) + ") and y: (" + deploymentArea.y + "," + (deploymentArea.height + deploymentArea.y) + ")."});
      return;
    }

    else if (this.map.isOccupied(character.area) === true)
    {
      sm.logged[player.username].emit("deploymentResponse", {success: false, error: "You can't place more than one character in the same tile."});
      return;
    }

    this.positions[characters[i].id] = characters[i].position;
    sm.logged[player.username].emit("deploymentResponse", {success: true, error: null});
  }

  this.deployedPlayers++;
}

create.prototype.assignDeploymentAreas = function(p1, p2)
{
  var obj = {};
  obj[p1.username] = area.create(0, 0, WIDTH, 3);
  obj[p2.username] = area.create(0, HEIGHT - 3, WIDTH, HEIGHT);
  return obj;
}

create.prototype.verifyOwner = function(data)
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

  if (this.koCharacters[data.username].includes(data.character.id) === true)
  {
    //KOed character
    throw new Error("This character is knocked out.");
  }
}

create.prototype.processMovement = function(data, socket)
{
  var actor = this.players[socket.username].characters[data.id];

  try
  {
    this.verifyOwner(data);
    ruleset.move(actor, map, data.position);
    this.positions[data.id] = data.position;
  }

  catch(err)
  {
    socket.emit("movementResponse", {success: false, error: err, characterID: null, position: null});
  }

  socket.emit("movementResponse", {success: true, error: null, characterID: data.id, position: data.position});
  sm.emitMany(this.players.filter(function(player) {return player.username != socket.username;}), "movementBroacast", {characterID: data.id, position: data.position});
}

create.prototype.processMelee = function(data, socket)
{
  var resolvedPack;
  var translatedPack;
  var actor = this.players[socket.username].characters[data.character.id];
  //var target = this.players[data.target.player].characters[data.target.id];

  try
  {
    this.verifyOwner(data);
    resolvedPack = ruleset.melee(actor, data.targetPosition, actor.getWeapon(data.weapon), this.map);
    translatedPack = interpreter.translateMelee(resolvedPack);
    //TODO map packages to players depending on which characters show up in the results
  }

  catch(err)
  {
    socket.emit("attackResponse", {success: false, error: err});
  }

  //socket.emit("attackResponse", {success: true, error: null});
  sm.emitMany(this.players, "attackBroadcast", translatedPack);
  sm.logged[data.target.player].emit("")
}

create.prototype.processRanged = function(data, socket)
{
  var resolvedPack;
  var translatedPack;
  var actor = this.players[socket.username].characters[data.character.id];
  var target = this.players[data.target.player].characters[data.target.id];

  try
  {
    this.verifyOwner(data);
    resolvedPack = ruleset.ranged(actor, target, data.weapon);
    translatedPack = interpreter.translateAttack(resolvedPack);
  }

  catch(err)
  {
    socket.emit("attackResponse", {success: false, error: err, });
  }

  socket.emit("attackResponse", {success: true, error: null, });
  sm.emitMany(this.players.filter(function(player) {return player.username != socket.username;}), "attackBroadcast", translatedPack);
}

create.prototype.processEndTurn = function(data, socket)
{
  var actor = this.players[data.username].characters[data.character.id];
  var pack = {actor: actor, battle: this, characters: this.characters, map: this.map, data: {}};
  var resolvedPack = ruleset.endTurn(pack);

  for (var i = 0; i < this.players; i++)
  {
    var player = this.players[i];

    if (this.koCharacters[player.username].length >= player.characters.length)
    {
      //battle ends
      this.processEndBattle();
      return;
    }
  }

  this.turn++;

  if (this.turn % this.characters.length === 0)
  {
    this.round++;
  }

  this.order.shift();
  socket.emit("startTurn", this.order);
}

create.prototype.processEndBattle = function()
{
  //TODO
}

create.prototype.emitBattleStartPacks = function()
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

create.prototype.readyCharacters = function()
{
  for (var i = 0; i < this.characters.length; i++)
  {

  }
}

create.prototype.getAPTurnOrder = function(turns)
{
  var order = [];
  var characterSpeeds = [];
  var index = 0;

  for (var i = 0; i < this.characters.length; i++)
  {
    characterSpeeds[i] = {"character": this.characters[i], "speed": this.characters[i].ap};
  }

  characterSpeeds = characterSpeeds.sort(function(a, b)
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
    order.push(this.characters[index].id);
    ++index.wrap(this.characters.length - 1);
  }

  return order;
}

create.prototype.getTickTurnOrder = function(turns)
{
  var order = [];
  var characterSpeeds = [];

  //create a virtual "current speed" meter and simulate several turns, to generate
  //the future order. The function returns an array of characters (the character objects)
  //in the proper turn order for a given length of turns. It does so by increasing
  //the current speed meter and then sorting the characterSpeeds array and grabbing the
  //resulting first one each turn, since that will be the faster character.
  for (var i = 0; i < this.characters.length; i++)
  {
    characterSpeeds[i] = {"character": this.characters[i], "speed": this.characters[i].speed, "currSpeed": 0};
  }

  for (var i = 0; i < turns; i++)
  {
    for (var j = 0; j < this.characters.length; j++)
    {
      order.push(characterSpeeds.sort(function(a, b)
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
      })[0].character);

      characterSpeeds[0].currSpeed += characterSpeeds[0].speed;
    }
  }

  return order;
}
