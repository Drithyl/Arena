
var contentModule;
var database;
var formulas = require("./formulas.js");
var uuid;
var characterCtor;

module.exports =
{
  init: function(content, charCtor, idGenerator, db)
  {
    contentModule = content;
    characterCtor = charCtor;
    uuid = idGenerator;
    database = db;
    return this;
  },

  createCharacter(player, cb)
  {
    player.socket.on("characterCreated", function(characterData, clientCb)
  	{
      var race;
      var builtData;
      var attributes;
      var constructedCharacter;

      try
      {
        verifyName(characterData.name);
        race = verifyRace(characterData.race);
        attributes = calculateAttributes(race, characterData.attributes);
        builtData = buildCharacterData(player.username, race, characterData.name, attributes);
        constructedCharacter = new characterCtor(builtData);
        player.addCharacter(constructedCharacter);
      }

      catch(err)
      {
        clientCb(err, null);
        return;
      }

      database.save("characters", constructedCharacter.toDatabase(), function(err, result)
      {
        if (err)
        {
          clientCb(err, null);
          return;
        }

        cb(constructedCharacter);
        clientCb(null);
      });
  	});
  }
}

  /*
  * Reattach the relevant data to the characters that a username owns on server
  * launch and then return an object of those characters accessible through
  * their ids.  Arguments:
  *
  *    username       the username of the player that owns the characters
  *
  *     data          the data of the character previously verified by verifyCharacterData()
  *
  * This function may fail for several reasons:
  *
  *    NotFound       No character belonging to this username is found. In this
  *                   case, no return object will be supplied.
  */

function buildCharacterData(username, race, name, attributes)
{
  var obj = Object.assign({}, race);

  obj.name = name;
  obj.id = uuid();
  obj.player = username;
  obj.attributes = attributes;
  obj.equipment = {};

  for (var key in race.slotCount)
  {
    obj.equipment[key] = [];
  }

  //The rest of the fields will use default values provided in the Character construtor

  return obj;
}

function verifyRace(raceID)
{
  var race = contentModule.getOneRace({id: raceID});

  if (race == null)
  {
    throw "The chosen race is invalid. Please choose only from the given options.";
  }

  return race;
}

function verifyName(name)
{
	if (typeof name !== "string")
	{
		throw "The name must be a string of text.";
	}

  if (/\S+/.test(name) === false)
  {
    throw "The name must not be left empty.";
  }

  if (/[\(\)\{\}\[\]\!\?\@\#\$\%\^]/.test(name) === true)
  {
    throw "The name must not contain special characters other than spaces, dashes or underscores.";
  }

  if (name.length < 3 && name.length > 36)
  {
    throw "The name length must be between 3 and 36 characters.";
  }
}

function calculateAttributes(race, attributes)
{
  var pointsUsed = 0;
  var maxPoints = race.startingPoints;
  var finalAttributes = race.attributes;

  if (attributes == null)
  {
    throw "The character data must contain the attribute starting points assigned.";
  }

  for (var key in finalAttributes)
  {
    if (attributes[key] == null)
    {
      continue;
    }

    if (isNaN(attributes[key]) === true || attributes[key].isFloat() === true)
    {
      throw `The attribute ${key} must be an integer.`;
    }

    pointsUsed += attributes[key];

    if (pointsUsed > maxPoints)
    {
      throw "You have invested more points than your race allows.";
    }

    if (typeof formulas[key] !== "function")
    {
      throw `The attribute ${key} is lacking a formula to calculate it,`;
    }

    finalAttributes[key] = formulas[key](attributes[key], finalAttributes[key]);
  }

  return finalAttributes;
}

function generateID()
{
  //line borrowed from https://gist.github.com/gordonbrander/2230317
  var id = '_' + Math.random().toString(36).substr(2, 9);

  while (module.exports.list.filter(function(char) {  return char.id == id;  }).length > 0)
  {
    id = '_' + Math.random().toString(36).substr(2, 9);
  }

  return id;
}
