
//the original object of the library
var io;

//socket id keys that point to the socket
var list = {};

//socket id keys that point to the username
var usernames = {};

//username keys that point to their socket
var logged = {};

module.exports =
{
  init: function(server, connectFn, disconnectFn)
  {
    io = require("socket.io")(server, {});

    //applies to all sockets, and passes the client socket as argument
    io.on("connection", function(socket)
    {
      module.exports.addSocket(socket);

      try
      {
        connectFn(socket);
      }

      catch (err)
      {
        throw err;
      }
    });

    io.on("disconnect", function(socket)
    {
      try
      {
        disconnectFn(socket);
      }

      catch (err)
      {
        throw err;
      }

      finally
      {
        module.exports.removeSocket(socket.id);
      }
    });

    return this;
  },

  addSocket: function(socket)
  {
    list[socket.id] = socket;
  },

  addLoggedPlayer: function(username, socket)
  {
    logged[username] = socket;
    usernames[socket.id] = username;
  },

  getPlayerSocket: function(username)
  {
    return logged[username];
  },

  getUsername: function(socketID)
  {
    return usernames[socketID];
  },

  removeSocket: function(id)
  {
    list[id].disconnect(true);
    delete list[id];
  },

  broadcast: function(trigger, data)
  {
    io.broadcast(trigger, data);
  },

  emit: function(username, trigger, data)
  {
    logged[username].emit(trigger, data);
  },

  listen: function(username, trigger, fn)
  {
    logged[username].on(trigger, function(data)
    {
      fn(data, logged[username]);
    });
  },

  emitMany: function(players, trigger, data)
  {
    for (var username in players)
    {
      this.emit(username, trigger, data);
    }
  },

  listenMany: function(players, trigger, fn)
  {
    for (var username in players)
    {
      this.listen(username, trigger, fn);
    }
  },

  emitLogged: function(trigger, data)
  {
    for (var username in logged)
    {
      logged[id].emit(trigger, data);
    }
  },

  listenLogged: function(trigger, fn)
  {
    for (var username in logged)
    {
      this.emit(username, trigger, fn);
    }
  },

  emitAll: function(trigger, data)
  {
    for (var id in list)
    {
      list[id].emit(trigger, data);
    }
  },

  listenAll: function(trigger, fn)
  {
    for (var id in list)
    {
      list[id].listen(trigger, function(data)
      {
        fn(data, list[id]);
      });
    }
  }
}
