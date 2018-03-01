
var keys;
var forms;

module.exports =
{
  content: null,
  keys: null,

  init: function(contentModule, index)
  {
    keys = index;
    this.content = contentModule;
    forms = require("./forms.js").init(contentModule, index);
    return this;
  },

  buildPlayerCharacters: function(player)
  {
    var verifiedArr = [];

    for (var i = 0; i < player.characters.length; i++)
    {
      try
      {
        verifyCharacterData(player.characters[i]);
        player.characters[i] = buildCharacter(player.characters[i], player.username);
      }

      catch (err)
      {
        throw err;
      }
    }
  }
}

  /*
  * Reattach the relevant data to the characters that a username owns on server
  * launch and then return an object of those characters accessible through
  * their ids.  Arguments:
  *
  *    username       the username of the player that owns the characters
  *
  * This function may fail for several reasons:
  *
  *    NotFound       No character belonging to this username is found. In this
  *                   case, no return object will be supplied.
  */

function buildCharacter(verifiedData, username)
{
  var obj = {};
  var race = content.getForms({key: keys.NAME, value: verifiedData.race});

  obj[keys.NAME] = verifiedData.name;
  obj[keys.ID] = generateID();
  obj[keys.PLAYER] = username;
  obj[keys.TRANS_POINTS] = 0;
  obj[keys.FORM] = race[keys.ID];
  obj[keys.CURR_FORM] = race[keys.ID];
  obj[keys.ALL_FORMS] = race[keys.ALL_FORMS];
  obj[keys.MAX_HP] = verifiedData[keys.MAX_HP];
  obj[keys.CURR_HP] = obj[keys.MAX_HP] + race[keys.MAX_HP];
  obj[keys.MR] = verifiedData[keys.MR];
  obj[keys.MRL] = verifiedData[keys.MRL];
  obj[keys.STR] = verifiedData[keys.STR];
  obj[keys.ATK] = 0;
  obj[keys.DEF] = 0;
  obj[keys.PRC] = 0;
  obj[keys.AP] = 0;
  obj[keys.MP] = 0;
  obj[keys.SPEED] = 0;
  obj[keys.AFFL_LIST] = {};
  obj[keys.PATH_LIST] = {};
  obj[keys.PROP_LIST] = [];
  obj[keys.AB_LIST] = {};
  obj[keys.PART_LIST] = race[keys.PART_LIST];

  for (var key in keys.SLOT_LIST)
  {
    obj[keys.SLOT_LIST[key]] = {};
    obj[keys.SLOT_LIST[key]][keys.EQUIPPED] = [];
    obj[keys.SLOT_LIST[key]][keys.FREE] = race[keys.SLOT_LIST][keys.SLOT_LIST[key]];
    obj[keys.SLOT_LIST[key]][keys.TOTAL] = race[keys.SLOT_LIST][keys.SLOT_LIST[key]];
  }

  return obj;
}

/*
* Verify the data of a single character sent by a client on character creation
* to make sure that it is valid. Arguments:
*
*   data            The character data. It is supposed to contain a string .name
*                   property, a string .race property, and a subObject
*                   .attributes, with a collection of the attribute keys and
*                   integer values that the client invested.
*
* This function may fail for several reasons:
*
*   RaceError       The race in .race could not be found within the content.
*
*   NameError       The character name is incorrect. It might not be a string,
*                   contain invalid characters, be too short or too long.
*
*   AttributesError One or more of the attributes either does not exist, or
*                   is not a number, or the client somehow invested more points
*                   than his chosen race allows.
*/

function verifyCharacterData(data)
{
  var chosenRace = content.getForms({key: keys.NAME, value: char.race});

  if (chosenRace === null || chosenRace.length <= 0)
  {
    throw "The chosen race is invalid. Please choose only from the given options.";
  }

  try
  {
    verifyName(data.name);
    verifyAttributes(chosenRace, data.attributes);
  }

  catch (err)
  {
    throw err;
  }
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

function verifyAttributes(race, attributes)
{
  var maxPoints = race[keys.START_POINTS];
  var pointsUsed = 0;

  for (var key in attributes)
  {
    if (race[key] == null)
    {
      throw "The attribute " + key + " is invalid. It does not exist.";
    }

    if (isNaN(attributes[key]) === true)
    {
      throw "The attribute " + key + " must be an integer.";
    }

    pointsUsed += attributes[key];

    if (pointsUsed > maxPoints)
    {
      throw "You have invested more points than your race allows.";
    }
  }
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
