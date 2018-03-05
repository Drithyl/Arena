
var damageStrategy = require("./damage.js");

module.exports =
{
  apply: function(pack, result)
  {
    var fireShieldWeapon =
    {
      name: "Fire Shield",
      damage: 0,
      damageTypes: ["fire"],
      properties: ["magical", "noStrength"]
    }

    if (pack.target.abilities.fireShield == null)
    {
      return;
    }

    if (pack.data.currentWeapon.reach >= pack.target.abilities.fireShield)
    {
      //weapon long enough that fire shield does not affect it
      return;
    }

		fireShieldWeapon.damage = pack.target.abilities.fireShield - pack.data.currentWeapon.reach;

    //the data passed to the damage arc has to be rebuilt with only the actor and target so that
    //data that would normally carry on won't override the data of the original attack by the actor,
    //since fire shield resolves like a separate attack, on top of the fact that the actor and target
    //have to be swapped, since it's the original actor being targeted now
    damageStrategy.apply(fireShieldWeapon, {actor: pack.target, target: pack.actor, data: {}}, result);
  }
}
