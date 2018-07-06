

"use strict";

//Type-related custom functions
require("./server/prototype_functions.js");

const port = 3000;
var wasLaunchedCorrectly = false;

//3rd-Party libraries
var express = require ("express");
var app = express();
var server = require("http").Server(app);
var uuid = require("uuid/v4");
var spawn = require('child_process').spawn;

//modules that do not require later initialization
var socketManager = require("./server/socket_manager.js").init(server);
const logger = require("./server/logger.js");
var characterModule = require("./server/character.js");
var itemModule = require("./server/item.js");
var formModule = require("./server/form.js");
var specialAbilityModule = require("./server/special_ability.js");
var mapModule = require("./server/map.js");
const contentCtors =
{
  Character: characterModule.Character,
  Item: itemModule.Item,
  Form: formModule.Form,
  SpecialAbility: specialAbilityModule.SpecialAbility
};

//Modules that require later initialization
var content;
var playerModule;
var loginModule;
var characterCreator;
var battleModule;
var challengeModule;


/********************************
*   EXPRESS SERVER DATA PATHS   *
********************************/

app.get("/", function (req, res)
{
  res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));
app.use("/shared", express.static(__dirname + "/shared"));


/**************************
*   DATABASE CONNECTION   *
**************************/

require("./server/database.js").connect(function(err, dbModule)
{
  if (err)
  {
    logger.add("A database could not be found. Shutting down initialization.");
    return;
  }

  loadContent(dbModule);
  server.listen(port);
  wasLaunchedCorrectly = true;
  logger.add("Server initialized correctly, listening for incoming connections.");

  try
  {

  }

  catch(err)
  {
    logger.add("There was an error while loading content, server cannot start properly. The error was: " + err);
  }
});


/**************************************************
*   DATA AND JSON CONTENT LOADING AND REVIVING    *
**************************************************/

function loadContent(dbModule)
{
  battleModule = require("./server/battle.js").init(socketManager);
  content = require("./server/content.js").init(dbModule, contentCtors);
  playerModule = require("./server/player.js").init(characterModule.Character.list);
  challengeModule = require("./server/challenge.js").init(socketManager, playerModule.Player.list, battleModule);
  loginModule = require("./server/login.js").init(dbModule, playerModule);
  characterCreator = require("./server/character_creator.js").init(content, characterModule.Character, uuid, dbModule);

  //database content (async), handled in separate cb functions for readability,
  //needs to be passed somewhere
  content.loadCharacters(function(err, characters)
  {
    if (err)
    {
      throw new Error("The characters could not be loaded from the database. The error was: " + err);
    }

    characterModule.list = characters;
  });
}


/**************************
*   SOCKETS' CONNECTION   *
**************************/

//Initializes the socket manager and adds a callback for when any socket connects or
//disconnects (see below)
require("./server/socket_manager.js").init(server, onSocketConnect, onSocketDisconnect);

//Socket connected callback
function onSocketConnect(socket)
{
  if (wasLaunchedCorrectly === false)
	{
    logger.add("Server was not launched correctly. Ignoring connection from socket " + socket.id);
		throw new Error("Server was not launched correctly. Ignoring connection from socket " + socket.id);
	}

  socket.emit("connected", getInitPack());
  logger.add(socket.id + " connected.");

  loginModule.signIn(socket, function(player)
  {
    socketManager.addLoggedPlayer(player.username, socket);
    challengeModule.listenToChallenges(socket);
    //TODO: attachChat(socket);

    if (player.hasCharacters() === false)
    {
      characterCreator.createCharacter(player, function(constructedCharacter)
      {
        //player is ready to go
      });
    }
  });

  loginModule.signUp(socket, function(username)
  {
    //stuff to do (response event to client is handled by the login module directly)
  });
}

function onSocketDisconnect(socket)
{
  //clear stuff?
  playerModule.disconnect(socket.id);
  logger.add(socket.id + " connected.");
}


/**************************************
*   INITIALIZATION PACK FOR CLIENTS   *
**************************************/

function getInitPack()
{
  var obj =
	{
		forms: JSON.stringify(content.getRaces({categories: "Starting Race"})),
		players: playerModule.getClientPack()
	}

  return obj;
}
