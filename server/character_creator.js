
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

  whenCharacterCreated(player, cb)
  {
    player.socket.on("characterCreated", function(characterData, clientCb)
  	{
      var chosenForm;
      var builtData;
      var constructedCharacter;

      try
      {
        chosenForm = verifyForm(characterData.form);
        verifyName(characterData.name);
        verifyAttributes(chosenForm, characterData.attributes);

        builtData = buildCharacterData(player.username, characterData);
        constructedCharacter = new characterCtor(builtData, builtData.formList);
        player.addCharacter(constructedCharacter);
      }

      catch(err)
      {
        clientCb(err.message, null);
        return;
      }

      database.save("characters", constructedCharacter.toDatabase(), function(err, res)
      {
        if (err)
        {
          clientCb(err.message, null);
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

function buildCharacterData(username, data)
{
  var obj = {};

  obj.name = data.name;
  obj.id = uuid();
  obj.player = username;
  obj.maxHP = formulas.maxHP(data.maxHP, form.maxHP);
  obj.magicResistance = formulas.magicResistance(data.magicResistance, form.magicResistance);
  obj.morale = formulas.morale(data.morale, form.morale);
  obj.strength = formulas.strength(data.strength, form.strength);

  for (var i = 0; i < data.form.formList.length; i++)
  {
    obj.formList.push(contentModule.getOneForm({id: data.form.formList[i]}));
  }

  return obj;
}

function verifyForm(formID)
{
  var form = contentModule.getOneForm({id: formID});

  if (form == null)
  {
    throw "The chosen form is invalid. Please choose only from the given options.";
  }

  return form;
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

  if (attributes == null)
  {
    throw "The character data must contain the attribute starting points assigned.";
  }

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
