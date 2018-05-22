
var database;
var playerModule;

module.exports =
{
  init: function(db, pm)
  {
    database = db;
    playerModule = pm;
    return this;
  },

  whenSignedIn: function(socket, cb)
  {
    socket.on("signIn", function(data, clientCb)
  	{
      isValidPassword(data, function(err, result)
      {
        if (err)
        {
          clientCb("Error when validating password: " + err.message, null);
          throw new Error("signIn() error when validating password: " + err.message);
        }

        if (result === false)
        {
          clientCb("The username and/or password is invalid.", null);
          return;
        }

        //create player obj
        var player = new playerModule.Player(socket, data.username);
        cb(player);
        clientCb(null, player.hasCharacters());
        socket.broadcast.emit("playerJoined", {username: data.username});
        socket.removeAllListeners("signIn");
      });
  	});
  },

  whenSignedUp: function(socket, cb)
  {
    socket.on("signUp", function(data, clientCb)
  	{
      if (typeof data.username != "string" || /^[A-Z0-9_\-\']{3,24}$/i.test(data.username) === false)
      {
        clientCb("The username must be a string, contain only letters, numbers, underscores, dashes or single-quotes and be of 3 to 24 characters long.", null);
        return;
      }

      else if (typeof data.password != "string" || /.{6,36}/.test(data.password) === false)
      {
        clientCb("The password must be a string and be of 6 to 36 characters long.", null);
        return;
      }

      isUsernameTaken(data.username, function(err, res)
      {
        if (err)
        {
          clientCb("There was a problem when checking if the username is taken.", null);
          throw new Error("signIn() error when checking if the username is taken: " + err.message);
        }

        if (res === true)
        {
          clientCb("This username is already taken. Please choose another one.", null);
          return;
        }

        database.addUser(data, function(err)
        {
          if (err)
          {
            clientCb("There was a problem when adding the user to the database.", null);
            throw new Error("signIn() error when checking if the username is taken: " + err.message);
          }

          cb(data.username);
          clientCb(null);
          socket.removeAllListeners("signUp");
        });
      });
  	});
  }
}

function isValidPassword(data, cb)
{
  database.findOne("accounts", {username: data.username, password: data.password}, function(err, res)
  {
    if (err)
    {
      cb(err, null);
      return;
    }

    if (res == null)
    {
      cb(null, false);
    }

    else cb(null, true);
  });
}

function isUsernameTaken(username, cb)
{
  database.findOne("accounts", {username: username}, function(err, res)
  {
    if (err)
    {
      cb(err, null);
      return;
    }

    if (res == null)
    {
      cb(null, false);
    }

    else cb(null, true);
  });
}
