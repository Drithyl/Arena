
var ruleset;

module.exports.init = function(rules)
{
  ruleset = rules;
  return this;
};


module.exports.apply = function(context, map, subStrategies)
{
  var results = [];
  var currentPosition = map.getCharacterPosition(actor.id);
  var inTheWay = map.getCharactersInLine(currentPosition, targetPosition);

  for (var i = 0; i < inTheWay.length; i++)
  {
    results.push(context.createSequence(inTheWay[i], "trample"));

    if (inTheWay[i].size >= context.actor.size)
    {
      results[i].addResult("blocked", true);
      results[i].addResult("obstacle", inTheWay[i]);
      map.separateMovingCharacter(currentPosition, blockedPosition, context.actor.id, inTheWay[i].id);
      results[i].addResult("finalPosition", map.getCharacterPosition(context.actor.id));
      return;
    }

    //TODO: hit the character in the way for trample damage and displace it. Call trampleAttack substrategy
    subStrategies.trampleAttack.resolve(context);
  }

  results[i].addResult("finalPosition", map.setCharacterPosition(targetPosition, context.actor.id));
}
