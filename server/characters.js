

module.exports =
{
  online: {},
  list: null,
  db: null,
  keyIndex: null,

  init: function(database, characters, index)
  {
    this.db = database;
    this.list = characters;
    this.keyIndex = index;
    return this;
  },

  addOnline(id, character)
  {
    this.online[id] = character;
  },

  getClientPack(id)
  {
    var obj = {};

    for (var key in this.online)
    {
      obj[key] = this.online[key];
    }

    return obj;
  }
}
