
var characterList;

module.exports =
{
  init: function(charList)
  {
    characterList = charList;
    return this;
  },

  Player: function(socket, name)
  {
    var _socket = socket;
    var _username = name;
    var _battle;
    var _challenges = {};
    var _characters = characterList.filter(function(character)
    {
      return character.player === _username;
    });

    Object.defineProperty(this, "username",
    {
      get: function()
      {
        return _username;
      },
      enumerable: true
    });

    Object.defineProperty(this, "socket",
    {
      get: function()
      {
        return _socket;
      },
      enumerable: true
    });

    Object.defineProperty(this, "isBattling",
    {
      get: function()
      {
        if (_battle == null)
        {
          return false;
        }

        else return true;
      },
      enumerable: true
    });

    this.hasCharacters = function()
    {
      if (_characters.length > 0)
      {
        return true;
      }

      else return false;
    };

    this.addCharacter = function(character)
    {
      _characters.push(character);
    }

    module.exports.Player.list.push(this);
    return this;
  },

  disconnect: function(socketID)
  {
    module.exports.Player.list.forEach(function(player, index)
    {
      if (player.socket.id === socketID)
      {
        delete player;
        module.exports.Player.list.splice(index, 1);
      }
    });
  },

  getClientPack: function()
  {
    var arr = [];

    module.exports.Player.list.forEach(function(player)
    {
      arr.push(player.username);
    });

    return arr;
  }
}

module.exports.Player.list = [];
