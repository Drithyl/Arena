
var prototype;

module.exports =
{
  create: function(x, y, width, height)
  {
    this.x = x;
    this.width = width;
    this.y = y;
    this.height = height;
    this.center = {x: Math.floor(this.width / 2), y: Math.floor(this.height / 2)};
    return this;
  }
}

prototype = module.exports.create.prototype;

prototype.position = function()
{
  return {x: this.x, y: this.y};
}

prototype.globalCenter = function()
{
  return {x: this.x + this.center.x, y: this.y + this.center.y};
}

prototype.assignPosition = function(p)
{
  this.x = p.x;
  this.y = p.y;
}

prototype.left = function()
{
  return this.x;
};

prototype.right = function()
{
  return this.x + this.width;
};

prototype.top = function()
{
  return this.y;
};

prototype.bottom = function()
{
  return this.y + this.height;
};

prototype.distance = function(area)
{
  var xDistance;
  var yDistance;

  if (this.right() <= area.left())
  {
    xDistance = area.left() - this.right();
  }

  else xDistance = this.left() - area.right();

  if (this.bottom() <= area.top())
  {
    yDistance = area.top() - this.bottom();
  }

  else yDistance = this.top() - area.bottom();

  if (xDistance >= yDistance)
  {
    return xDistance;
  }

  else return yDistance;
}

prototype.containsArea = function(area)
{
  if (area.left() >= this.left() && area.right() < this.right() &&
      area.top() >= this.top() && area.bottom() < this.bottom())
  {
    return true;
  }

  else return false;
};

prototype.contains = function(x, y)
{
  if (x >= this.left() && x < this.right() && y >= this.top() && y < this.bottom())
  {
    return true;
  }

  else return false;
};
