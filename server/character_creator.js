
var content;
var formulas = require("./formulas.js");

module.exports =
{
  keys: null,

  init: function(contentModule, index)
  {
    keys = index;
    content = contentModule;
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
        player.characters[i] = buildCharacterData(player.characters[i], player.username);
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

function buildCharacterData(data, username)
{
  var obj = {};
  var form = content.getForms({key: "name", value: data.form});

  obj.name = data.name;
  obj.id = generateID();
  obj.player = username;
  obj.transitionPoints = 0;
  obj.form = form.id;
  obj.formIndex = 0;
  obj.formList = [];
  obj.maxHP = formulas.startingPoints.maxHP(data.maxHP, form.maxHP);
  obj.currentHP = obj.maxHP;
  obj.mr = formulas.startingPoints.mr(data.mr, form.mr);
  obj.morale = formulas.startingPoints.morale(data.morale, form.morale);
  obj.strength = formulas.startingPoints.strength(data.strength, form.strength);
  obj.attack = 0;
  obj.defence = 0;
  obj.precision = 0;
  obj.ap = 0;
  obj.afflictions = {};
  obj.paths = {};
  obj.properties = [];
  obj.abilities = {};
  obj.parts = form.parts;

  for (var i = 0; i < form.formList.length; i++)
  {
    obj.formList.push(content.getForms({key: "id", value: form.formList[i]}));
  }

  for (var key in form.slots)
  {
    obj.slots[key] = {};
    obj.slots[key].equipped = [];
    obj.slots[key].free = form.slots[key];
    obj.slots[key].total = form.slots[key];
  }

  return obj;
}

/*
* Verify the data of a single character sent by a client on character creation
* to make sure that it is valid. Arguments:
*
*   data            The character data. It is supposed to contain a string .name
*                   property, a string .form property, and a subObject
*                   .attributes, with a collection of the attribute keys and
*                   integer values that the client invested.
*
* This function may fail for several reasons:
*
*   FormError       The form in .form could not be found within the content.
*
*   NameError       The character name is incorrect. It might not be a string,
*                   contain invalid characters, be too short or too long.
*
*   AttributesError One or more of the attributes either does not exist, or
*                   is not a number, or the client somehow invested more points
*                   than his chosen form allows.
*/

function verifyCharacterData(data)
{
  var chosenForm = content.getForms({key: "name", value: data.form});

  if (chosenForm === null || chosenForm.length <= 0)
  {
    throw "The chosen form is invalid. Please choose only from the given options.";
  }

  try
  {
    verifyName(data.name);
    verifyAttributes(chosenForm, data.attributes);
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

function verifyAttributes(form, attributes)
{
  var maxPoints = form.startingPoints;
  var pointsUsed = 0;

  for (var key in attributes)
  {
    if (form[key] == null)
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
      throw "You have invested more points than your form allows.";
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
