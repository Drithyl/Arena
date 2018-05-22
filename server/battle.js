
const battleUpdate = require("./battle_update.js");
var attack = require("./attack.js");
var interpreter = require("./battle_interpreter.js");
var socketManager;
var prototype;
var list;

const WIDTH = 120;
const HEIGHT = 120;

module.exports.init = function(sockets)
{
  socketManager = sockets;
  return this;
}

/*
* Create a battle object and all of its functions and listeners. Arguments:
*
*   players         An array of the involved player objects (like:
*                   {username: "yadda", characters: {id1: character1, id2: character2, etc.}})
*
*   map             A map object which will contain all spacial representations of characters.
*/
module.exports.Battle = function(players, map)
{
  var _characters = [];
  var _players = {};
  var _started = false;
  var _deployedPlayers = 0;
  var _turn = 1;
  var _round = 1;
  var _map = map;
  var _order = getAPTurnOrder(_characters, 20);


  /**********************
  *   INITIALIZATION    *
  **********************/

  _map.setDeploymentArea(players[0].username, 0, 0, WIDTH, 50);
  _map.setDeploymentArea(players[1].username, 0, HEIGHT - 50, WIDTH, HEIGHT);

  players.forEach(function(player, index)
  {
    _players[player.username] = player;
  });

  for (var username in _players)
  {
    var player = _players[username];

    //STORING THE BATTLE UNDER EACH PLAYER'S USERNAME
    list[username] = this;

    _characters.concat(player.characters);
  }

  readyCharacters();


  /**************************
  *   GETTERS AND SETTERS   *
  **************************/

  Object.defineProperty(this, "turn",
  {
    get: function()
    {
      return _turn;
    },
    enumerable: true
  });

  Object.defineProperty(this, "round",
  {
    get: function()
    {
      return _round;
    },
    enumerable: true
  });

  Object.defineProperty(this, "isDeploymentFinished",
  {
    get: function()
    {
      if (_deployedPlayers >= Object.keys(_players).length)
      {
        return true;
      }

      else return false;
    },
    enumerable: true
  });


  /****************************
  *   PRIVILEDGED FUNCTIONS   *
  ****************************/

  this.startDeployment = function()
  {
    for (var username in _players)
    {
      var player = _players[username];

      player.socket.emit("deploymentPhase", getDeploymentPack(username));

      player.socket.on("deployment", function(data, clientCb)
      {
        deployCharacters(player, data, clientCb);

        if (this.isDeploymentFinished === true)
        {
          emitInitPack();
          listenToActions();
        }
      });
    }
  }

  /**********************
  *   PRIVATE METHODS   *
  ***********************/

  function getDeploymentPack(username)
  {
    return {map: {x: _map.width, y: _map.height}, area: _map.getDeploymentArea(username)};
  };

  function verifyDeployment(player, charPositions)
  {
    var deploymentArea = _deploymentAreas[player.username];

    player.characters.forEach(function(character)
    {
      var position = charPositions[character.id];

      if (position == null)
      {
        throw new Error("The character " + character.name + " cannot be found among the deployment positions sent.");
      }

      _map.deployCharacter(player.username, character.id, position);
    });

    _deployedPlayers++;
  }

  function deployCharacters(player, data, clientCb)
  {
    try
    {
      verifyDeployment(player, data.positions);
    }

    catch(err)
    {
      clientCb(err, null);
    }

    clientCb(null);
  };

  function emitInitPack()
  {
    var playerPacks = {};

    _players.forEach(function(player, index)
    {
      playerPacks[player.username] = {};

      player.characters.forEach(function(character)
      {
        playerPacks[player.username][id] = character.giveEnemyData();
      });
    });

    _players.forEach(function(player, index)
    {
      var initPack = {order: this.order, positions: this.positions, players: {}};

      for (var username in playerPacks)
      {
        if (username != player.username)
        {
          initPack.players[username] = playerPacks[username];
        }
      }

      player.socket.emit("battleInitPack", initPack);
    });
  };

  function listenToActions()
  {
    for (var username in _players)
    {
      var player = _players[username];

      player.socket.on("movement", function(data, clientCb)
      {
        processMovement(player, data, clientCb);
      });

      player.socket.on("attack", function(data, clientCb)
      {
        processAttack(player, data, clientCb);
      });

      player.socket.on("endTurn", function(data, clientCb)
      {
        processEndTurn(player, data, clientCb);
      });
    }
  }

  function processMovement(player, data, clientCb)
  {
    var actor = player.characters.find(function(char)
    {
      return data.character.id === char.id;
    });

    try
    {
      verifyData(actor, data);
      dispatchUpdatePack(strategyManager.move(actor, data.targetPosition, _map), buildUpdatePack());
    }

    catch (err)
    {
      clientCb(err, null);
    }
  }

  function processAttack(player, data, clientCb)
  {
    var actor = player.characters.find(function(char)
    {
      return data.character.id === char.id;
    });

    try
    {
      verifyData(actor, data);
      dispatchUpdatePack(attack.resolve(actor, data.targetPosition, actor.getEquippedItem(data.slotType, data.slotIndex), _map), buildUpdatePack());
    }

    catch(err)
    {
      clientCb(err, null);
    }
  }

  function processEndTurn(data, socket)
  {
    var actor;
    var pack;
    var resolvedPack;
    var koCharacters;

    try
    {
      actor = getVerifiedActor(data, socket);
      pack = {actor: actor, battle: this, characters: this.characters, map: this.map, data: {}};
      //TODO resolvedPack = ;

      for (var username in _players)
      {
        koCharacters = Object.filter(_players[username].characters, function(character)
        {
          return character.getStatusEffect("ko") != null;
        });

        if (koCharacters.length >= _players[username].characters.length)
        {
          //battle ends
          processEndBattle();
          return;
        }
      }

      _turn++;

      if (_turn % _characters.length === 0)
      {
        _round++;
      }

      _order.shift();
      socket.emit("startTurn", _order);
    }

    catch(err)
    {
      socket.emit("endTurnError", err);
    }
  }

  function processEndBattle()
  {
    //TODO
  }

  //pulls the data of the latest changes in the character objects and the map object.
  //this must be gathered for all players at once because the data gets deleted after
  //it is pulled from the objects, as it only stores the most recent changes
  function buildUpdatePack()
  {
    var pack = {};
    var characterUpdates = {};

    _characters.forEach(function(character)
    {
      characterUpdates[character.id] = {};
      characterUpdates[character.id].position = _map.getLastMovements(character.id);
      Object.assign(characterUpdates[character.id], character.getChanges());

      for (var username in _players)
      {
        var player = _players[username];

        if (pack[username] == null)
        {
          pack[username] = {};
        }

        if (character.player === username)
        {
          pack[username][character.id] = characterUpdates[character.id];
        }

        else pack[username][character.id] = Object.assign({}, characterUpdates[character.id].position, character.getPublicData());
      }
    });

    return pack;
  }

  function dispatchUpdatePack(resultsPack, changesPack)
  {
    for (var username in _players)
    {
      _players[username].socket.emit("battleUpdate", {results: resultsPack, changes: pack[username]});
    }
  }

  function verifyData(actor, data)
  {
    if (actor == null)
    {
      throw new Error("The character cannot be found under this player.");
    }

    if (actor.id != _order[0])
    {
      //wrong turn
      throw new Error("It is not this character's turn to act.");
    }

    if (actor.getStatusEffect("ko") != null)
    {
      //KOed character
      throw new Error("This character is knocked out.");
    }

    if (data.targetPosition == null || _map.getCharacterAt(data.targetPosition) == null)
    {
      throw new Error("The target position is null or empty.");
    }

    if (_map.isOutOfBounds(data.targetPosition) === true)
    {
      throw new Error("The target position is out of bounds.");
    }

    if (data.slotType != null && data.slotIndex == null)
    {
      throw new Error("The slot index chosen is null.");
    }

    else if (data.slotType == null && data.slotIndex != null)
    {
      throw new Error("The slot type chosen is null.");
    }

    else if (actor.getEquippedItem(data.slotType, data.slotIndex) == null)
    {
      throw new Error("There is no equipped item at the given slot, or the slot does not exist in this character.");
    }
  }

  function readyCharacters()
  {
    for (var i = 0; i < _characters.length; i++)
    {

    }
  }
}


/********************
*   PUBLIC METHODS  *
********************/

prototype = module.exports.Battle.prototype;


/**********************
*   MODULE METHODS    *
**********************/

function getAPTurnOrder(characters, turns)
{
  var order = [];
  var characterSpeeds = [];
  var index = 0;

  for (var i = 0; i < characters.length; i++)
  {
    characterSpeeds[i] = {"character": characters[i], "speed": characters[i].actionPoints};
  }

  characterSpeeds = characterSpeeds.sort(function(a, b)
  {
    if (b.actionPoints === a.actionPoints)
    {
      //random order if same AP
      return Math.floor(Math.random()*2) == 1 ? 1 : -1;
    }

    else return b.actionPoints - a.actionPoints;
  })

  for (var i = 0; i < turns; i++)
  {
    order.push(characters[index].id);
    ++index.wrap(characters.length - 1);
  }

  return order;
}

function getTickTurnOrder(characters, turns)
{
  var order = [];
  var characterSpeeds = [];

  //create a virtual "current speed" meter and simulate several turns, to generate
  //the future order. The function returns an array of characters (the character objects)
  //in the proper turn order for a given length of turns. It does so by increasing
  //the current speed meter and then sorting the characterSpeeds array and grabbing the
  //resulting first one each turn, since that will be the faster character.
  for (var i = 0; i < characters.length; i++)
  {
    characterSpeeds[i] = {"character": characters[i], "speed": characters[i].speed, "currSpeed": 0};
  }

  for (var i = 0; i < turns; i++)
  {
    for (var j = 0; j < characters.length; j++)
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
