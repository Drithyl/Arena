

module.exports.apply = function(actor, targetPosition, map, ruleset, subStrategies)
{
  var result = {strategy: "defaultMovement", targetPosition: targetPosition, blocked: false};
  var currentPosition = map.getCharacterPosition(actor.id);
  var inTheWay = map.getCharactersInLine(currentPosition, targetPosition);

  if (inTheWay.length < 1)
  {
    result.finalPosition = map.setCharacterPosition(targetPosition, actor.id);
    return result;
  }

  result.blocked = true;
  result.obstacle = inTheWay[0];
  map.separateMovingCharacter(currentPosition, blockedPosition, actor.id, inTheWay[0].id);
  result.finalPosition = map.getCharacterPosition(actor.id);

  return [result];
}
