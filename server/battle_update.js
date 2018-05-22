

module.exports =
{
  mapCharactersAffected: function(players, results)
  {
    var obj = {};

    for (var i = 0; i < results.length; i++)
    {
      if (results[i] == null || results[i].target == null)
      {
        continue;
      }

      var characterID = results[i].target.id;
      var controller = players.filter(function(player)
      {
        return player.characters[characterID] != null;
      })[0].username;

      if (obj[controller] == null)
      {
        obj[controller] = [];
      }

      if (obj[controller].includes(characterID) === false)
      {
        obj[controller].push(characterID);
      }
    }

    return obj;
  }
}
