
var content;
var ruleset;
var specialAttack;

module.exports.init = function(rules, contentModule, specialAttackModule)
{
  ruleset = rules;
  content = contentModule;
  specialAttack = specialAttackModule;
  return this;
};

module.exports.onMovement = function(callerSequence, actor, targetPosition, map)
{

};

module.exports.onEnteringReach = function(callerSequence, actor, reachingCharacter, map)
{

};

module.exports.onLeavingReach = function(callerSequence, actor, reachingCharacter, map)
{

};

module.exports.onHit = function(callerSequence, actor, target, map)
{
  //stuff like weapons' onHit abilities trigger here
};

module.exports.onImpact = function(callerSequence, actor, target, map)
{

};

module.exports.onDamage = function(callerSequence, actor, target, map)
{
  //stuff like weapons' onDamage abilities trigger here

  /************
  *   DRAIN   *
  ************/

  if ((actor.getTotalAbility("drain") > 0 || callerSequence.weapon.getAbility("drain") > 0))
  {
    var drainRate = Math.floor((actor.getTotalAbility("drain") + callerSequence.weapon.getAbility("drain")) * 0.01);
    var hpDrain = Math.floor(damageInflicted * drainRate).cap(actor.getTotalAttribute("maxHP") - actor.currentHP);
    var fatigueDrain = (hpDrain * 2).cap(actor.fatigue);

    if (hpDrain > 0)
    {
      callerSequence.addResult("drain", {drainRate: drainRate, healedHP: actor.healHP(hpDrain), fatigueReduced: actor.reduceFatigue(fatigueDrain)});
    }
  }
};

module.exports.onHitReceived = function(callerSequence, attacker, self, map)
{
  //stuff like fire shield triggers here


  /******************
  *   FIRE SHIELD   *
  ******************/

  //TODO: see where fire shield needs to be called from
  specialAttack.resolve(context, callerSequence, callerSequence.damage.damageLeft, map, module)
};

module.exports.onImpactReceived = function(callerSequence, attacker, self, map)
{
  //stuff like poison barbs/skin triggers here
};

module.exports.onDamageReceived = function(callerSequence, attacker, self, map)
{
  //stuff like berserk triggers here

  /**************
  *   BERSERK   *
  **************/

  if (self.getTotalAbility("berserk") != null)
  {
    var moraleRoll = dice.DRN() + self.getTotalAttribute("morale");
    var difficulty = dice.DRN() + 12;

    if (moraleRoll > difficulty)
    {
      self.setStatusEffect("berserk", target.getTotalAbility("berserk"));
      callerSequence.addResult("berserk", {moraleRoll: moraleRoll, difficulty: difficulty, success: true});
    }

    else callerSequence.addResult("berserk", {moraleRoll: moraleRoll, difficulty: difficulty, success: false});
  }
};

module.exports.onAttackEnd = function(context, callerSequence, actor, target, map)
{
  /**************
  *   CLEAVE    *
  **************/

  if (callerSequence.weapon.canCleave === true && callerSequence.damage.damageLeft > 0 &&
     (callerSequence.weapon.hasDamageType("pierce") || callerSequence.weapon.hasDamageType("blunt") || callerSequence.weapon.hasDamageType("slash")))
  {
    //TODO: see where cleave needs to be called from
    cleave(context, callerSequence, callerSequence.damage.damageLeft, map, module);
  }
};

module.exports.onCleaveEnd = function(context, callerSequence, actor, target, map)
{

};

function resolveDamageEffect(target, map)
{

}
