
var keys;
const locale = require("./server/strings.json");

module.exports =
{
  init: function(index)
  {
    keys = index;
    return this;
  },

  //The outer i loop is for each attack, and the inner j loop
  //is for each strategy within each attack.
  translateAttack: function(pack, results)
  {
    var templates = [];

    for (var i = 0; i < results.length; i++)
    {
      templates.push([]);

      for (var j = 0; < results[i].length; j++)
      {
        if (Object.keys(results[i][j]).length < 2)
        {
          //the strategy did not run, probably because neither side
          //had the ability in question. Length < 2 because there
          //will always be at least 1 key, the .strategy one with
          //the name of the strategy, even if it gets returned early.
          continue;
        }

        var tmplt = translate(pack, results[i][j]);

        if (tmplt == null)
        {
          throw new Error("The strategy " + results[i][j].strategy + " could not be found in translate().");
        }

        templates[i].push(tmplt);
      }
    }

    return templates;
  },

  translateTurnEnd: function(pack, results)
  {
    var templates = [];

    for (var i = 0; < results.length; j++)
    {
      if (Object.keys(results[i]).length < 2)
      {
        //the strategy did not run, probably because neither side
        //had the ability in question. Length < 2 because there
        //will always be at least 1 key, the .strategy one with
        //the name of the strategy, even if it gets returned early.
        continue;
      }

      var tmplt = translate(pack, results[i]);

      if (tmplt == null)
      {
        throw new Error("The strategy " + results[i].strategy + " could not be found in translate().");
      }

      templates.push(tmplt);
    }

    return templates;
  }
}

function translate(pack, result)
{
  switch(result.strategy)
  {
    case "awe":
      return awe(pack, result);

    case "attack":
      return attack(pack, result);

    case "glamour":
      return glamour(pack, result);

    case "displacement":
      return displacement(pack, result);

    case "fireShield":
      return fireShield(pack, result);

    case "ethereal":
      return ethereal(pack, result);

    case "mrNegates":
      return mrNegates(pack, result);

    case "poisonBarbs":
      return poisonBarbs(pack, result);

    case "poisonSkin":
      return poisonSkin(pack, result);

    case "damage":
      return damage(pack, result);

    case "berserk":
      return berserk(pack, result);

    case "drain":
      return drain(pack, result);

    case "fatigue":
      return fatigue(pack, result);

    case "heatAura":
      return heatAura(pack, result);

    case "coldAura":
      return coldAura(pack, result);

    case "poisonAura":
      return poisonAura(pack, result);

    default:
      return null;
  }
}

function awe(pack, result)
{
  var template = {"string": "", "vars":
  {
    moraleRoll: result.moraleRoll,
    aweRoll: result.aweRoll,
    actor: pack.actor[keys.NAME],
    target: pack.target[keys.NAME]
  }};

  template.string = locale.awe.check + "\n";

  if (result.failed === true)
  {
    template.string += locale.awe.fail + "\n";
  }

  else template.string += locale.awe.success + "\n";
  return template;
}

function attack(pack, result)
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

function glamour(pack, result)
{
  var template = {"string": "", "vars": {}};

  if (result.failed === true)
  {
    template.string = locale.glamour.fail + "\n";
  }

  else template.string = locale.glamour.success + "\n";
  return template;
}

function displacement(pack, result)
{
  var template = {"string": "", "vars": {}};

  if (result.failed === true)
  {
    template.string = locale.displacement.fail + "\n";
  }

  else template.string = locale.displacement.success + "\n";
  return template;
}

function fireShield(pack, result)
{
  var template = {"string": "", "vars": {}};

  template.string = locale.fireShield.intro + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function ethereal(pack, result)
{
  var template = {"string": "", "vars":
  {
    target: pack.target[keys.NAME]
  }};

  if (result.failed === true)
  {
    template.string += locale.ethereal.fail + "\n";
  }

  else template.string += locale.ethereal.success + "\n";
  return template;
}

function mrNegates(pack, result)
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

function poisonBarbs(pack, result)
{
  var template = {"string": "", "vars": {}};

  template.string = locale.poisonBarbs.intro + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function poisonSkin(pack, result)
{
  var template = {"string": "", "vars": {}};

  template.string = locale.poisonSkin.intro + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function damage(pack, result)
{
  var template = {"string": "", "vars":{}};

  applyDamageTemplate(template, result);
  return template;
}

function berserk(pack, result)
{
  var template = {"string": "", "vars":
  {
    moraleRoll: result.moraleRoll,
    difficultyRoll: result.difficultyRoll,
    actor: pack.actor[keys.NAME]
  }};

  template.string = locale.berserk.check + "\n";

  if (result.triggered === false)
  {
    template.string += locale.berserk.fail + "\n";
  }

  else template.string += locale.berserk.success + "\n";
  return template;
}

function drain(pack, result)
{
  var template = {"string": "", "vars":
  {
    hpDrain: result.hpDrain,
    fatigueDrain: result.fatigueDrain,
    actor: pack.actor[keys.NAME]
  }};

  template.string = locale.drain + "\n";
  return template;
}

function fatigue(pack, result)
{
  var template = {"string": "", "vars":
  {
    fatigue: result.fatigue,
    actor: pack.actor[keys.NAME]
  }};

  template.string = locale.fatigue + "\n";
}

function heatAura(pack, result)
{
  var template = {"string": "", "vars":
  {
    nbrOfAuras: result.nbrOfAuras,
    damageRoll: result.damageRoll,
    protectionRoll: result.protectionRoll,
    damageInflicted: result.damageInflicted,
    damageType: result.damageType,
    target: pack.target[keys.NAME],
    shiftedShapeName: result.shiftedShapeName,
    droppedItems: result.droppedItems
  }};

  template.string = locale.heatAura + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function coldAura(pack, result)
{
  var template = {"string": "", "vars":
  {
    nbrOfAuras: result.nbrOfAuras
  }};

  template.string = locale.coldAura + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function poisonAura(pack, result)
{
  var template = {"string": "", "vars": {}};

  template.string = locale.poisonAura + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function applyDamageTemplate(template, result)
{
  template.vars.damageRoll = result.damageRoll;
  template.vars.protectionRoll = result.protectionRoll;
  template.vars.damageInflicted = result.damageInflicted;
  template.vars.damageType = result.damageType;
  template.vars.shiftedShapeName = result.shiftedShapeName;
  template.vars.droppedItems = result.droppedItems;
  template.vars.target = pack.targer[keys.NAME];
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

  if (result.shiftedShapeName != null)
  {
    template.string += locale.damage.shapeshift + "\n";

    if (result.droppedItems.length > 0)
    {
      template.string += locale.damage.droppedItems + "\n";
    }
  }

  if (result.targetKO === true)
  {
    template.string += locale.damage.targetKO + "\n";
  }
}
