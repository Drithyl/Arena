
var damageStrategy = require("./damage.js");

module.exports =
{
  apply: function(pack, result)
  {
    var poisonBarbsWeapon =
    {
      name: "Poison Barbs",
      damage: 10,
      reach: 3,
      damageType: ["poison"],
      properties: ["noStrength"]
    }

    if (pack.target.abilities.poisonBarbs == null)
    {
      return;
    }

    if (pack.distance >= poisonBarbsWeapon.reach)
    {
      //distance long enough that barbs can't hit
      return;
    }

    //the data passed to the damage arc has to be rebuilt with only the actor and target so that
    //data that would normally carry on won't override the data of the original attack by the actor,
    //since poison barbs resolves like a separate attack, on top of the fact that the actor and target
    //have to be swapped, since it's the original actor being targeted now
		damageStrategy.apply(poisonBarbsWeapon, {actor: pack.target, target: pack.actor, data: {}}, result);
  }
}
