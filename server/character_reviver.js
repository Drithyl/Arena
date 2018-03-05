
var forms;
var slots;
var content;

module.exports =
{
  init: function(content)
  {
    content = content;
    forms = require("./forms.js").init(contentModule);
    slots = require("./slots.js").init(contentModule);
    return this;
  },

  /*
  * Revives the relevant properties of a character for ease of access during runtime,
  * such as grabbing the item objects that the character has equipped, or calculating
  * the different total protection values of each bodypart. Arguments:
  *
  *   char           The character object that must be lulled.
  */

  revive: function(character, data)
  {
    reviveSlots(character, data);
    reviveForms(character, data);
  },

  /*
  * Puts some of the character object's content to sleep, as in replacing it for
  * its IDs (in the case of equipped items and forms) or base values (for protection),
  * so as to save the character into the database. These content objects will be
  * revived again on server launch (see reviveContent()). Arguments:
  *
  *   char           The character object that must be lulled.
  */

  lull: function(character)
  {
    char.lullSlots(character);
    char.lullForms(character);
  }
}

function reviveSlots(character, data)
{
  character.slots = slots.Slots(data.slots);

  /*for (var key in character.slots)
  {
    var equipped = character.slots[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      equipped[i] = content.getItems({key: "id", value: equipped[i].id})[0];
    }
  }*/
}

function reviveForms(character, data)
{
  character.form = forms.Form(data.form);
  character.formIndex = data.formIndex;

  for (var i = 0; i < data.formList.length; i++)
  {
    character.form.formList[i] = forms.Form(data.formList[i]);
  }
}

function lullSlots(character)
{
  for (var key in character.slots)
  {
    var equipped = character.slots[key].equipped;

    for (var i = 0; i < equipped.length; i++)
    {
      equipped[i] = equipped[i].id;
    }
  }
}

function lullForms(character)
{
  character.form = character.form.id;

  for (var i = 0; i < character.formList.length; i++)
  {
    character.formList[i] = character.formList[i].id;
  }
}
