
var ruleset;

module.exports.init = function(rules)
{
  ruleset = rules;
  return this;
};


module.exports.apply = function(context, map, subStrategies)
{
  var results = context.createSequence(context.targetPosition, "defaultMovement");
  var currentPosition = map.getCharacterPosition(context.actor.id);
  var inTheWay = map.getCharactersInLine(currentPosition, targetPosition);

  if (inTheWay.length > 0)
  {
    results.addResult("blocked", true);
    results.addResult("obstacle", inTheWay[0]);
    map.separateMovingCharacter(currentPosition, blockedPosition, context.actor.id, inTheWay[0].id);
    results.addResult("finalPosition", map.getCharacterPosition(context.actor.id));
  }

  else results.addResult("finalPosition", map.setCharacterPosition(targetPosition, context.actor.id));
}
