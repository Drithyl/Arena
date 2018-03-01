

var io;

module.exports =
{
  list: {},

  init: function(io)
  {
    io = io;
    return this;
  },

  disconnect: function(id)
  {
    delete this.list[id];
  },

  broadcast: function(trigger, data)
  {
    io.broadcast(trigger, data);
  },

  emitMany: function(players, trigger, data)
  {
    for (var i = 0; i < players.length; i++)
    {
      if (typeof players[i] === "string")
      {
        this.logged[players[i]].emit(trigger, data);
      }

      else this.logged[players[i].username].emit(trigger, data);
    }
  },

  listenMany: function(players, trigger, fn)
  {
    for (var i = 0; i < players.length; i++)
    {
      var username;

      if (typeof players[i] === "string")
      {
        username = players[i];
      }

      else username = players[i].username;

      this.logged[username].on(trigger, function(data)
      {
        fn(data, this.logged[username]);
      });
    }
  }
}
