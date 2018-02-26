
var express = require ("express");
var app = express();
var serv = require("http").Server(app);
var io = require("socket.io")(serv, {});
var pf = require("./server/prototype_functions.js");
var keys = require("./shared/keyIndex.json");
var rw;
var sm;
var battle;
var characterModule;
var playersModule;
var content;
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

	socket.on("sendCharacter", function(data)
	{
		verifyCharacters(data, socket);
	});

  socket.on("disconnect", function()
  {
    delete sm.logged[socket.username];
    delete sm.list[socket.id];
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
*    Error          The playersModule throws an error when initializing,
*										particularly when trying to revive the player objects.

*	Any error here will cause the function to exit and the boolean
* wasLaunchedCorrectly to remain as false, which will make the server ignore any
* incoming connections, since there are issues to be resolved.
*/

function initializeServer(cb)
{
	keys.arr = keys.toFlatArr();
	keys.lowerCaseArr = keys.arr.toLowerCase();
	rw = require("./server/reader_writer.js").init(db, keys);
  sm = require("./server/socket_manager.js").init(io);
  battle = require("./server/battle.js").init(sm, keys);
	content = require("./server/content.js").init(rw.readContent(), keys);

	db.find("characters", {}, function(err, charsFetched)
	{
		if (err)
		{
			cb("CRITICAL ERROR, server launch corrupted: " + err.name + ": in initializeServer(): " + err.message);
			return;
		}

		characterModule = require("./server/character.js").init(db, content, keys, charsFetched);

		db.find("players", {}, function(err, playersFetched)
		{
			if (err)
			{
				cb("CRITICAL ERROR, server launch corrupted: " + err.name + ": in initializeServer(): " + err.message);
				return;
			}

			try
			{
        playersModule = require("./server/players.js").init(db, playersFetched, characterModule, keys);
			}

			catch(err)
			{
				cb("CRITICAL ERROR, server launch corrupted: " + err.name + ": in playersModule.init(): " + err.message, null);
				return;
			}

			serv.listen(port);
			wasLaunchedCorrectly = true;
			rw.log("Server started.");
		});
	});
}

function getInitPack()
{
	var obj =
	{
		forms: content.getForms({key: keys.CAT_LIST, value: keys.CAT.START}),
		players: playersModule.getClientPack()
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
      socket.emit("signInResponse", {success: false, characters: null});
      return;
    }

    db.getCharacters(data.username, function(err, result)
    {
      if (err)
      {
        throw new Error("signIn() error when fetching characters for this user: " + err.message);
      }

      if (result != null && result.length === 4)
      {
        setPlayerOnline(data.username, socket);
      }

      socket.emit("signInResponse", {success: true, characters: result});
    });
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
*   data            Contains the username and password of the user who signed in.
*
*   socket          The socket through which the user connected to the server.
*/

function setPlayerOnline(username, socket)
{
  //starting point for a client
  attachChat(socket);
  socket.username = data.username;
	playersModule.addOnline(username);
  socket.broadcast.emit("playerJoined", player.functionless());
}

function verifyCharacters(data, socket)
{
	var player = playersModule.create(socket.username);

	characterModule.registerCharacters(data, player, function(err, verifiedCharacters)
	{
		if (err)
		{
			socket.emit("characterFail", err.name + ": in verifyCharacters(): " + err.message);
			return;
		}

		playersModule.revive(player);
		playersModule.addOnline(socket.id, player.username);
		socket.emit("characterSuccess");
		socket.broadcast.emit("playerJoined", player.functionless());
	});
}

function attachChat(socket)
{
	socket.on("sendMsgToServer", function(data)
	{
		var msg = {name: socket.id, message: data};
		io.emit("addToChat", msg);
	});

	socket.on("evalServer", function(data)
	{
		if (DEBUG === false)
		{
			return;
		}

		var res = eval(data);
		socket.emit("evalAnswer", res);
	});
}
