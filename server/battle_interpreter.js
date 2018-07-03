
const stringLibrary = require("./strings.json");

module.exports =
{
  init: function()
  {
    return this;
  },

  translate: function(pack)
  {
    var sequences = pack.getSequences();
    var translations = [];

    //each sequence represents a whole attack (melee, ranged, or even substrategies
    //like the result of a fire shield effect)
    sequences.forEach(function(seq, index)
    {
      translations.push([]);

      //within each sequence key are stored the results of each particular step,
      //like the results of awe, of a hit check, or a damage check
      for (var [key, value] of seq.results)
      {
        if (value != null || Object.keys(value).length > 0)
        {
          translations[index].push(translateResults(pack, key, value));
        }
      }
    });

    return translations;
  },

  translateTurnEnd: function(pack, results)
  {
    var templates = [];

    for (var i = 0; i < results.length; j++)
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

function translateResults(pack, strategy, result)
{
  switch(strategy)
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
    actor: pack.actor.name,
    target: pack.target.name
  }};

  template.string = stringLibrary.awe.check + "\n";

  if (result.failed === true)
  {
    template.string += stringLibrary.awe.fail + "\n";
  }

  else template.string += stringLibrary.awe.success + "\n";
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

  template.string = stringLibrary.attack.check + "\n";

  if (result.failed === true)
  {
    template.string += stringLibrary.attack.fail + "\n";
  }

  else template.string += stringLibrary.attack.success + "\n";
  return template;
}

function glamour(pack, result)
{
  var template = {"string": "", "vars": {}};

  if (result.failed === true)
  {
    template.string = stringLibrary.glamour.fail + "\n";
  }

  else template.string = stringLibrary.glamour.success + "\n";
  return template;
}

function displacement(pack, result)
{
  var template = {"string": "", "vars": {}};

  if (result.failed === true)
  {
    template.string = stringLibrary.displacement.fail + "\n";
  }

  else template.string = stringLibrary.displacement.success + "\n";
  return template;
}

function fireShield(pack, result)
{
  var template = {"string": "", "vars": {}};

  template.string = stringLibrary.fireShield.intro + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function ethereal(pack, result)
{
  var template = {"string": "", "vars":
  {
    target: pack.target.name
  }};

  if (result.failed === true)
  {
    template.string += stringLibrary.ethereal.fail + "\n";
  }

  else template.string += stringLibrary.ethereal.success + "\n";
  return template;
}

function mrNegates(pack, result)
{
  var template = {"string": "", "vars":
  {
    penetrationRoll: result.penetrationRoll,
    mrRoll: result.mrRoll
  }};

  template.string = stringLibrary.meNegates.check + "\n";

  if (result.failed === true)
  {
    template.string += stringLibrary.meNegates.fail + "\n";
  }

  else template.string += stringLibrary.meNegates.success + "\n";
  return template;
}

function poisonBarbs(pack, result)
{
  var template = {"string": "", "vars": {}};

  template.string = stringLibrary.poisonBarbs.intro + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function poisonSkin(pack, result)
{
  var template = {"string": "", "vars": {}};

  template.string = stringLibrary.poisonSkin.intro + "\n";
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
    actor: pack.actor.name
  }};

  template.string = stringLibrary.berserk.check + "\n";

  if (result.triggered === false)
  {
    template.string += stringLibrary.berserk.fail + "\n";
  }

  else template.string += stringLibrary.berserk.success + "\n";
  return template;
}

function drain(pack, result)
{
  var template = {"string": "", "vars":
  {
    hpDrain: result.hpDrain,
    fatigueDrain: result.fatigueDrain,
    actor: pack.actor.name
  }};

  template.string = stringLibrary.drain + "\n";
  return template;
}

function fatigue(pack, result)
{
  var template = {"string": "", "vars":
  {
    fatigue: result.fatigue,
    actor: pack.actor.name
  }};

  template.string = stringLibrary.fatigue + "\n";
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
    target: pack.target.name,
    shiftedShapeName: result.shiftedShapeName
  }};

  template.string = stringLibrary.heatAura + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function coldAura(pack, result)
{
  var template = {"string": "", "vars":
  {
    nbrOfAuras: result.nbrOfAuras
  }};

  template.string = stringLibrary.coldAura + "\n";
  applyDamageTemplate(template, result);
  return template;
}

function poisonAura(pack, result)
{
  var template = {"string": "", "vars": {}};

  template.string = stringLibrary.poisonAura + "\n";
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
  //template.vars.droppedItems = result.droppedItems;
  template.vars.target = pack.targer.name;
  template.string = stringLibrary.damage.check + "\n";

  if (result.failed === true)
  {
    if (result.twistFate === true)
    {
      template.string += stringLibrary.twistFate + "\n";
    }

    else template.string += stringLibrary.damage.fail + "\n";
  }

  else template.string += stringLibrary.damage.success + "\n";

  if (result.shiftedShapeName != null)
  {
    template.string += stringLibrary.damage.shapeshift + "\n";

    /*if (result.droppedItems.length > 0)
    {
      template.string += stringLibrary.damage.droppedItems + "\n";
    }*/
  }

  if (result.targetKO === true)
  {
    template.string += stringLibrary.damage.targetKO + "\n";
  }
}
