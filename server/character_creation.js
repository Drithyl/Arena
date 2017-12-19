
module.exports =
{
  db: null,
  content: null,
  keyIndex: null,

  init: function(database, contentModule, index)
  {
    this.db = database;
    this.content = contentModule;
    this.keyIndex = index;
    return this;
  },

  storeChar: function(data, socket, cb)
  {
    var chosenRace = content.getForms(keyIndex.NAME, data.race);
    data.username = socket.username;
    var character = buildCharacter(data);

    if (chosenRace === null || chosenRace.length <= 0)
    {
      throw "The chosen race is invalid. Please choose only from the given options.";
    }

    try
    {
      verifyCharName(data.name);
      verifyScores(chosenRace, data.attributes);
    }

    catch (err)
    {
      throw err;
    }

    db.collection("characters").insertOne(character, function(err, res)
    {
      if (err)
      {
        rw.log("An error occurred when trying to insert the character for " + socket.username + ": " + err);
        throw err;
      }

      socket.emit("characterSuccess");
      socket.broadcast.emit("playerJoined", character);
      cb(character);
    });
  }
}

function buildCharacter(data)
{
  return Object.assign({}, data);
}

function verifyCharName(name)
{
	if (typeof name !== "string")
	{
		throw "The name must be a string of text.";
	}

  else if (/\S+/.test(name) === false)
  {
    throw "The name must not be left empty.";
  }

  else if (/[\(\)\{\}\[\]\!\?\@\#\$\%\^]/.test(name) === true)
  {
    throw "The name must not contain special characters other than spaces, dashes or underscores.";
  }

  else if (name.length > 36)
  {
    throw "The name must be 36 characters or less in length.";
  }
}

function verifyScores(race, scores)
{
  var points = race[keyIndex.START_POINTS];

  for (var key in keyIndex.CHAR)
  {
    if (isNaN(race[key]) === false && isNaN(scores[key]) === false &&
        scores[key] < race[key])
    {
      throw "The " + key + " score is too low. It cannot go under the race's minimum.";
    }

    if (keyIndex.ATTR[key] == null)
    {
      if (scores[key] !== race[key])
      {
        throw "The " + key + " value cannot be different from that of the race.";
      }

      else continue;
    }

    if (scores[key] > race[key])
    {
      var diff = scores[key] - race[key];
      points -= diff;

      if (points < 0)
      {
        return false;
      }
    }
  }

  return true;
}
