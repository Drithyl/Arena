
const dice = require("./dice.js");
var keys;
var content;

module.exports =
{
  init: function(contentModule, index)
  {
    keys = index;
    content = contentModule;
    return this;
  },

  create: function(id)
  {
    var obj = content.getForms({key: keys.IDS, value: id})[0];
    attachFunctions(obj);
    reviveNaturalWeapons(obj);
    return obj;
  }
}

function attachFunctions(form)
{
  form.checkProperty = checkProperty;
  form.getNaturalAttack = getNaturalAttack;
}

function reviveNaturalWeapons(form)
{
  for (var i = 0; i < form[keys.NAT_WPN_LIST].length; i++)
  {
    form[keys.NAT_WPN_LIST][i] = content.getItems({key: keys.ID, value: form[keys.NAT_WPN_LIST][i][keys.ID]})[0];
  }
}

function checkProperty(key, t = this)
{
  if (t[keys.PROP_LIST].includes(key) === true)
  {
    return true;
  }

  else return false;
}

function getNaturalAttacks(id, t = this)
{
  var arr = [];

  if (t[keys.FORMS][keys.NAT_WPN_LIST] == null || t[keys.FORMS][keys.NAT_WPN_LIST].length < 1)
  {
    return arr;
  }

  return t[keys.FORMS][keys.NAT_WPN_LIST].filter(function(attack) {  return attack[keys.ID] === id; });
}

function hasNaturalAttack(id, t = this)
{
  if (t[keys.FORMS][keys.NAT_WPN_LIST] == null || t[keys.FORMS][keys.NAT_WPN_LIST].length < 1)
  {
    return false;
  }

  if (t[keys.FORMS][keys.NAT_WPN_LIST].filter(function(attack) {  return attack[keys.ID] === id; }).length < 1)
  {
    return false;
  }

  return true;
}
