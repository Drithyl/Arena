
var keys;
const order = require("./server/resolution_order.json");
const locale = require("./server/resolution_order.json");

module.exports =
{
  init: function(index)
  {
    keys = index;
    return this;
  },

  translateResults: function(data, results)
  {
    var strings = [];

    for (var i = 0; i < order.attack.length; i++)
    {
      if (Object.keys(results[i]).length <= 0)
      {
        //the strategy did not run, probably because neither side
        //had the ability in question
        continue;
      }

      var str = "";


    }
  }
}

function awe(data, result)
{
  var template = {"string": "", "vars":
  {
    moraleRoll: result.moraleRoll,
    aweRoll: result.aweRoll,
    actor: data.actor[keys.NAME],
    target: data.target[keys.NAME]
  }};

  template.string = locale.awe.check + "\n";

  if (result.failed === true)
  {
    template.string += locale.awe.fail + "\n";
  }

  else template.string += locale.awe.success + "\n";
  return template;
}

function attackCheck(data, result)
{
  var template = {"string": "", "vars":
  {
    attackRoll: result.attackRoll,
    defenceRoll: result.defenceRoll,
    parry: result.parry,
    hitLocation: result.hitLocation
  }};

  template.string = locale.attack.check + "\n";

  if (result.failed === true)
  {
    template.string += locale.attack.fail + "\n";
  }

  else template.string += locale.attack.success + "\n";
  return template;
}

function glamour(data, result)
{
  var template = {"string": "", "vars": {}};

  if (result.failed === true)
  {
    template.string = locale.glamour.fail + "\n";
  }

  else template.string = locale.glamour.success + "\n";
  return template;
}

function displacement(data, result)
{
  var template = {"string": "", "vars": {}};

  if (result.failed === true)
  {
    template.string = locale.displacement.fail + "\n";
  }

  else template.string = locale.displacement.success + "\n";
  return template;
}

function fireShield(data, result)
{
  var template = {"string": "", "vars":
  {
    damageRoll: result.damageRoll,
    protectionRoll: result.protectionRoll,
    damageInflicted: result.damageInflicted,
    damageType: result.damageType,
    target: data.target[keys.NAME]
  }};

  template.string = locale.fireShield.intro + "\n" + locale.fireShield.check + "\n";

  if (result.failed === true)
  {
    if (result.twistFate === true)
    {
      template.string += locale.twistFate + "\n";
    }

    else template.string += locale.fireShield.fail + "\n";
  }

  else template.string += locale.fireShield.success + "\n";
  return template;
}

function ethereal(data, result)
{
  var template = {"string": "", "vars":
  {
    target: data.target[keys.NAME]
  }};

  if (result.failed === true)
  {
    template.string += locale.ethereal.fail + "\n";
  }

  else template.string += locale.ethereal.success + "\n";
  return template;
}

function mrNegates(data, result)
{
  var template = {"string": "", "vars":
  {
    penetrationRoll: result.penetrationRoll,
    mrRoll: result.mrRoll
  }};

  template.string = locale.meNegates.check + "\n";

  if (result.failed === true)
  {
    template.string += locale.meNegates.fail + "\n";
  }

  else template.string += locale.meNegates.success + "\n";
  return template;
}

function poisonBarbs(data, result)
{
  var template = {"string": "", "vars":
  {
    damageRoll: result.damageRoll,
    protectionRoll: result.protectionRoll,
    damageInflicted: result.damageInflicted,
    damageType: result.damageType,
    target: data.target[keys.NAME]
  }};

  template.string = locale.poisonBarbs.intro + "\n" + locale.poisonBarbs.check + "\n";

  if (result.failed === true)
  {
    if (result.twistFate === true)
    {
      template.string += locale.twistFate + "\n";
    }

    else template.string += locale.poisonBarbs.fail + "\n";
  }

  else template.string += locale.poisonBarbs.success + "\n";
  return template;
}

function poisonSkin(data, result)
{
  var template = {"string": "", "vars":
  {
    damageRoll: result.damageRoll,
    protectionRoll: result.protectionRoll,
    damageInflicted: result.damageInflicted,
    damageType: result.damageType,
    target: data.target[keys.NAME]
  }};

  template.string = locale.poisonSkin.intro + "\n" + locale.poisonSkin.check + "\n";

  if (result.failed === true)
  {
    if (result.twistFate === true)
    {
      template.string += locale.twistFate + "\n";
    }

    else template.string += locale.poisonSkin.fail + "\n";
  }

  else template.string += locale.poisonSkin.success + "\n";
  return template;
}

function damageCheck(data, result)
{
  var template = {"string": "", "vars":
  {
    damageRoll: result.damageRoll,
    protectionRoll: result.protectionRoll,
    damageInflicted: result.damageInflicted,
    damageType: result.damageType
  }};

  template.string = locale.damage.check + "\n";

  if (result.failed === true)
  {
    if (result.twistFate === true)
    {
      template.string += locale.twistFate + "\n";
    }

    else template.string += locale.damage.fail + "\n";
  }

  else template.string += locale.damage.success + "\n";
  return template;
}

function berserk(data, result)
{
  var template = {"string": "", "vars":
  {
    moraleRoll: result.moraleRoll,
    difficultyRoll: result.difficultyRoll,
    actor: data.actor[keys.NAME]
  }};

  template.string = locale.berserk.check + "\n";

  if (result.triggered === false)
  {
    template.string += locale.berserk.fail + "\n";
  }

  else template.string += locale.berserk.success + "\n";
  return template;
}

function berserk(data, result)
{
  var template = {"string": "", "vars":
  {
    hpDrain: result.hpDrain,
    fatigueDrain: result.fatigueDrain,
    actor: data.actor[keys.NAME]
  }};

  template.string = locale.drain + "\n";
  return template;
}
