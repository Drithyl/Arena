
var vector = require("./vector.js");
var prototype;

module.exports =
{
  create: function(x, y, radius)
  {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}

prototype = module.exports.create.prototype;

prototype.position = function()
{
  return {x: this.x, y: this.y};
}

prototype.setPosition = function(x, y)
{
  this.x = x;
  this.y = y;
}

prototype.left = function()
{
  return this.x - this.radius;
};

prototype.right = function()
{
  return his.x + this.radius;
};

prototype.top = function()
{
  return this.y - this.radius;
};

prototype.bottom = function()
{
  return this.y + this.radius;
};

prototype.distanceToPoint = function(p)
{
  return vector.distance(this.position(), p);
}

prototype.distanceBetweenRadius = function(otherCircle)
{
  return vector.distance(this.position(), otherCircle.position()) - this.radius - otherCircle.radius;
};

prototype.distanceToReach = function(otherCircle)
{
  return vector.distance(this.position(), otherCircle.position()) - this.radius;
}

prototype.containsPoint = function(p)
{
  if (vector.distance(this.position(), p) <= this.radius)
  {
    return true;
  }

  else return false;
};
