
var express = require ("express");
var app = express();
var serv = require("http").Server(app);
var io = require("socket.io")(serv, {});
var pf = require("./server/prototype_functions.js");
var keyIndex = require("./shared/keyIndex.json");
keyIndex.arr = keyIndex.toFlatArr();
keyIndex.lowerCaseArr = keyIndex.arr.toLowerCase();
var rw = require("./server/reader_writer.js").init(keyIndex);
var charCreation;
var characters;
var content;
var port = 3000;
var SOCKET_LIST = {};
var spawn = require('child_process').spawn;
//var dbProcess = spawn("C:/Program Files/MongoDB/Server/3.4/bin/mongod.exe");
var mongo = require("mongodb");
var db;

mongo.MongoClient.connect("mongodb://localhost:27017", function(err, client)
{
	if (err)
	{
		rw.log("Something went wrong when connecting to mongo:\n\n" + err);
		return;
	}

	db = client.db("arena");
	init();
});

function init()
{
	content = require("./server/content.js").init(rw.readContent(), keyIndex);
	charCreation = require("./server/character_creation.js").init(db, content, keyIndex);

	db.collection("characters").find({}).toArray(function(err, result)
	{
		if (err)
		{
			rw.log("An error occurred when grabbing the characters from the db: " + err);
			return;
		}

		characters = require("./server/characters.js").init(db, result, keyIndex);
	});
}

function getInitPack()
{
	var obj =
	{
		forms: content.getForms(keyIndex.CAT_LIST, keyIndex.CAT.START),
		players: characters.online
	}

	return obj;
}

app.get("/", function (req, res)
{
  res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));
app.use("/shared", express.static(__dirname + "/shared"));

serv.listen(port);
rw.log("Server started.");

io.sockets.on("connection", function(socket)
{
  SOCKET_LIST[socket.id] = socket;
	rw.log(socket.id + " connected.");
	socket.emit("connected", getInitPack());

	socket.on("signIn", function(data)
	{
		isValidPassword(data, function(res)
		{
			if (res !== true)
			{
				socket.emit("signInRejected");
				return;
			}

			socket.emit("SignInAccepted");
			socket.username = data.username;

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

			isCharacterCreated(data.username, function(res)
			{
				if (res != null)
				{
					//starting point for a client
					characters.addOnline(socket.id, res);
					socket.emit("startGame");
					socket.broadcast.emit("playerJoined", res)
				}

				else socket.emit("createCharacter");
			});
		});
	});

	socket.on("signUp", function(data)
	{
		isUsernameTaken(data, function(res)
		{
			if (res === false)
			{
				addUser(data, function()
				{
					socket.emit("signUpResponse", {success: true});
				});
			}

			else socket.emit("signUpResponse", {success: false});
		});
	});

	socket.on("sendCharacter", function(data)
	{
		try
		{
			charCreation.storeChar(data, socket, function(char)
			{
				characters.addOnline(socket.id, char);
			});
		}

		catch (err)
		{
			socket.emit("characterFail", err.toString());
		}
	});

  socket.on("disconnect", function()
  {
    //player.onDisconnect(socket);
		delete SOCKET_LIST[socket.id];
  });
});

var isValidPassword = function(data, cb)
{
	db.collection("accounts").findOne({username:data.username, password:data.password}, function(err, res)
	{
		if (res != null)
		{
			cb(true);
		}

		else cb(false);
	});
}

var isUsernameTaken = function(data, cb)
{
	db.collection("accounts").find({username:data.username}, function(err, res)
	{
		if (res.length > 0)
		{
			cb(true);
		}

		else cb(false);
	});
}

var isCharacterCreated = function(username, cb)
{
	db.collection("characters").findOne({username: username}, function(err, res)
	{
		if (err)
		{
			rw.log("Something went wrong when trying to find whether a character was created:\n\n" + err);
			throw err;
		}

		if (res == null)
		{
			rw.log("No character created for username " + username + ".");
			cb(null);
		}

		else cb(res);
	});
}

var createCharacter = function(id, name, race)
{
	db.collection("characters").insert({})
}

var addUser = function(data, cb)
{
	db.collection("accounts").insertOne({username:data.username, password:data.password}, function(err)
	{
		if (err)
		{
			rw.log("An error occurred when inserting user " + data.username + ":\n\n" + err);
			return;
		}

		cb();
	});
}

setInterval(function()
{
  var pack;

  for (var id in SOCKET_LIST)
  {
    var socket = SOCKET_LIST[id];
    socket.emit("update", pack);
  }

}, 1000/25);
