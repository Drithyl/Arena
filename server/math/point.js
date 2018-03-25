
var polygon = require("./polygon.js");
var vector = require("./vector.js");

module.exports =
{
  create: function(x, y)
  {
    this.x = x;
    this.y = y;
  },

  zero: function()
  {
    return {x: 0, y: 0};
  },

  isZero: function(p)
  {
    if (p.x === 0 && p.y === 0)
    {
      return true;
    }

    else return false;
  },

  fromCoords: function(x, y, decimals = 2)
  {
    var self = {};

    self.x = x.round(decimals);
    self.y = y.round(decimals);

    return self;
  },

  fromPoint: function(p, decimals = 2)
  {
    var self = {};

    self.x = p.x.round(decimals);
    self.y = p.y.round(decimals);

    return self;
  }
}
