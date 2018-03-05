require("./server/prototype_functions.js");
var express = require ("express");
var app = express();
var serv = require("http").Server(app);
var io = require("socket.io")(serv, {});
var rw;
var sm;
var battle;
var characterModule;
var characterCreator;
var playerModule;
var content;
var formulas = require("./server/formulas.js");
var port = 3000;
var spawn = require('child_process').spawn;
//var dbProcess = spawn("C:/Program Files/MongoDB/Server/3.4/bin/mongod.exe");
var mongo = require("mongodb");
var db;
var wasLaunchedCorrectly = false;

app.get("/", function (req, res)
{
  res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));
app.use("/shared", express.static(__dirname + "/shared"));

mongo.MongoClient.connect("mongodb://localhost:27017", function(err, client)
{
	if (err)
	{
		throw err.name + ": in mongo.MongoClient.connect(): " + err.message;
	}

	db = require("./server/database.js").init(client.db("arena"));

	initializeServer(function(err)
	{
		if (err) throw err;
	});
});

io.sockets.on("connection", function(socket)
{
	if (wasLaunchedCorrectly === false)
	{
		throw new Error("Server was not launched correctly. Ignoring connection from socket " + socket.id);
	}

  sm.list[socket.id] = socket;
	rw.log(socket.id + " connected.");
	socket.emit("connected", getInitPack());

	socket.on("signIn", function(data)
	{
		signIn(data, socket);
	});

	socket.on("signUp", function(data)
	{
		signUp(data, socket);
	});

	socket.on("charactersCreated", function(data)
	{
		verifyCharacters(data, socket);
	});

  socket.on("disconnect", function()
  {
    playerModule.disconnect(socket.username);
    sm.disconnect(socket.id);
  });
});

/*
* Initialize all the relevant components that make the server-side work.  Arguments:
*
*    cb        			A callback that will be passed an error if something
*										critical happens that corrupts the initialization process.
*
* This function may fail for several reasons:
*
*    Error          The database module returns an error in the callback when
*										trying to fetch all existing characters.
*
*    Error          The database module returns an error in the callback when
*										trying to fetch all existing players.
*
*    Error          The playerModule throws an error when initializing,
*										particularly when trying to revive the player objects.

*	Any error here will cause the function to exit and the boolean
* wasLaunchedCorrectly to remain as false, which will make the server ignore any
* incoming connections, since there are issues to be resolved.
*/

function initializeServer(cb)
{
	rw = require("./server/reader_writer.js").init(db);
  sm = require("./server/socket_manager.js").init(io);
	content = require("./server/content.js").init(rw.readContent());
  characterCreator = require("./server/character_creator.js").init(content);
  characterModule = require("./server/character.js").init(content);

	db.find("players", {}, function(err, playersFetched)
	{
		if (err)
		{
			cb("CRITICAL ERROR, server launch corrupted: " + err.name + ": in initializeServer(): " + err.message);
			return;
		}

		try
		{
      playerModule = require("./server/player.js").init(db, playersFetched, characterModule, characterCreator);
      battle = require("./server/battle.js").init(sm, playerModule);
		}

		catch(err)
		{
			cb("CRITICAL ERROR, server launch corrupted: " + err.name + ": in playerModule.init(): " + err.message, null);
			return;
		}

		serv.listen(port);
		wasLaunchedCorrectly = true;
		rw.log("Server started.");
	});
}

function getInitPack()
{
	var obj =
	{
		forms: content.getForms({key: "categories", value: "startingForm"}),
		players: playerModule.getClientPack()
	}

	return obj;
}

function signIn(data, socket)
{
	db.isValidPassword(data, function(err, result)
	{
    if (err)
    {
      throw new Error("signIn() error when validating password: " + err.message);
    }

    if (result === false)
    {
      socket.emit("signInResponse", {success: false, player: null});
      return;
    }

    if (playerModule.playersList[data.username] == null)
    {
      socket.emit("signInResponse", {success: false, player: null});
      return;
    }

    if (Object.keys(playerModule.playersList[data.username].characters).length === 4)
    {
      setPlayerOnline(data.username, socket);
    }

    socket.username = data.username;
    socket.emit("signInResponse", {success: true, player: playerModule.playersList[data.username], formulas: formulas.startingPoints});
	});
}

function signUp(data, socket)
{
  if (typeof data.username != "string" || typeof data.password != "string" || data.username === "" || data.password === "")
  {
    socket.emit("signUpResponse", {success: false});
    return;
  }

	db.isUsernameTaken(data, function(err, res)
	{
    if (err)
    {
      throw new Error("signIn() error when checking if the username is taken: " + err.message);
    }

    if (res === true)
    {
      socket.emit("signUpResponse", {success: false});
      return;
    }

		db.addUser(data, function(err)
		{
      if (err)
      {
        throw new Error("signIn() error when checking if the username is taken: " + err.message);
      }

			socket.emit("signUpResponse", {success: true});
		});
	});
}

/*
* A new logged in player is dealt with here. Arguments:
*
*   username        The username of the user who signed in.
*
*   socket          The socket through which the user connected to the server.
*/

function setPlayerOnline(username, socket)
{
  //starting point for a client
  attachChat(socket);
  sm.logged[username] = socket;
	playerModule.addOnline(username);
  socket.broadcast.emit("playerJoined", {username: username});
}

function verifyCharacters(data, socket)
{
  playerModule.register(data.player, function(err, res)
  {
    if (err)
    {
      socket.emit("charactersCreatedResponse", {success: false, error: err.name + ": in verifyCharacters(): " + err.message});
			return;
    }

    setPlayerOnline(socket.username, socket);
    socket.emit("charactersCreatedResponse", {success: true, error: null});
  });
}

function attachChat(socket)
{
	socket.on("sendMessage", function(data)
	{
		io.emit("addToChat", {username: socket.username, message: data.message});
	});

	socket.on("evalServer", function(data)
	{
		if (DEBUG !== true)
		{
			return;
		}

		var res = eval(data);
		socket.emit("evalAnswer", res);
	});
}
