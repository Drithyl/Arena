

module.exports.apply = function(actor, targetPosition, map, ruleset, subStrategies)
{
  var results = [{strategy: "trample", targetPosition: targetPosition, blocked: false}];
  var currentPosition = map.getCharacterPosition(actor.id);
  var inTheWay = map.getCharactersInLine(currentPosition, targetPosition);

  for (var i = 0; i < inTheWay.length; i++)
  {
    if (inTheWay[i].size >= actor.size)
    {
      results[0].blocked = true;
      results[0].obstacle = inTheWay[i];
      map.separateMovingCharacter(currentPosition, blockedPosition, actor.id, inTheWay[i].id);
      results[0].finalPosition = map.getCharacterPosition(actor.id);
      return result;
    }

    //TODO: hit the character in the way for trample damage and displace it. Call trampleAttack substrategy
    results.push(sunStrategies.trampleAttack.resolve());
  }

  results[0].finalPosition = map.setCharacterPosition(targetPosition, actor.id);
  return result;
}
