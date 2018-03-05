
var db;
var characterModule;
var characterCreator;

module.exports =
{
  db: null,
  playerList: {},
  characterList: {},
  online: {},

  init: function(database, playersFetched, characterModule, characterCreator)
  {
    db = database;
    characterModule = characterModule;
    characterCreator = characterCreator;

    for (var i = 0; i < playersFetched.length; i++)
    {
      revivePlayerCharacters(playersFetched[i]);
    }

    return this;
  },

  addOnline: function(username)
  {
    this.online[username] = this.playerList[username];
  },

  disconnect: function(username)
  {
    delete this.online[username];
  },

  getClientPack: function()
  {
    var obj = {};

    for (var key in this.online)
    {
      obj[key] = this.online[key].username;
    }

    return obj;
  },

  register: function(player, cb)
  {
    try
    {
      characterCreator.buildPlayerCharacters(player);
      revivePlayerCharacters(player);
    }

    catch(err)
    {
      cb(err, null);
    }

    this.save(player, function(err, res)
    {
      if (err)
      {
        cb(err, null);
      }

      this.addOnline(player.username);
      this.playerList[player.username] = player;
      cb(null, true);
    });
  },

  /*
  * Save the player's state in the database. This will also save the characters
  * state. Arguments:
  *
  *   player         The player object to be saved. Its format is explicitly
  *                  declared in the create() function of this module.
  *
  *   cb             The callback function called once the saving is done, or
  *                  when an error occurs.
  *
  * This function may fail for several reasons:
  *
  *   ThrownError    The saveCharacters() function called in the character module
  *                  throws an error, likely because it could not save a character
  *                  into the database.
  *
  *   DBError        The attempt to save the player in the database
  *                  threw an error, which is then passed into the callback.
  */

  save: function(player, cb)
  {
    var clone = player.functionless();

    for (var id in clone.characters)
    {
      lullCharacter(clone.characters[id]);
    }

    db.save("players", clone, function(err, res)
    {
      if (err)
      {
        cb(err.name + ": in save(): " + err.message, null);
        return;
      }

      cb(null, res);
    });
  }
}

var lullCharacter = require("./character_reviver.js").lull;

function revivePlayerCharacters(player)
{
  for (var i = 0; i < player.characters.length; i++)
  {
    player.characters[i] = characterModule.Character(player.characters[i]);
    module.exports.characterList[player.characters[i].id] = player.characters[i];
  }
}
