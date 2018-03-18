
var prototype;

module.exports =
{
  Area: function(x, y, width, height)
  {
    this.x = x;
    this.width = width;
    this.y = y;
    this.height = height;
    this.center = {x: Math.floor(this.width / 2), y: Math.floor(this.height / 2)};
    return this;
  },

  AreaOfEffect: function(centerPosition, radius)
  {
    if (radius <= 0)
    {
      return this.Area(centerPosition.x, centerPosition.y, 1, 1);
    }

    else return this.Area(centerPosition.x - radius, centerPosition.y - radius, radius * 2 + 1, radius * 2 + 1);
  },

  areAdjacentPoints: function(p1, p2)
  {
    if (this.distance(p1, p2) === 1)
    {
      return true;
    }

    else return false;
  },

  distance: function(p1, p2)
  {
    var dist1 = Math.abs(p1[0] - p2[0]);
    var dist2 = Math.abs(p1[1] - p2[1]);

    if (dist1 > dist2)
    {
      return dist1;
    }

    else return dist2;
  }
}

prototype = module.exports.Area.prototype;

prototype.position = function()
{
  return {x: this.x, y: this.y};
}

prototype.globalCenter = function()
{
  return {x: this.x + this.center.x, y: this.y + this.center.y};
}

prototype.loopGlobal = function(fn)
{
  for (var i = 0; i < this.width; i++)
  {
    for (var j = 0; j < this.height; j++)
    {
      fn(i + this.x, j + this.y);
    }
  }
}

prototype.loopLocal = function(fn)
{
  for (var i = 0; i < this.width; i++)
  {
    for (var j = 0; j < this.height; j++)
    {
      fn(i, j);
    }
  }
}

prototype.assignPosition = function(x, y)
{
  this.x = x;
  this.y = y;
}

prototype.tileNumber = function()
{
  return this.x * this.y;
}

prototype.tiles = function()
{
  var tiles = [];

  this.loopGlobal(function(x, y)
  {
    tiles.push({x: x, y: y});
  });

  return tiles;
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

prototype.yAdjacent = function(area)
{
  if (this.top() === area.bottom() || this.bottom() === area.top())
  {
    return true;
  }

  else return false;
}

prototype.xAdjacent = function(area)
{
  if (this.left() === area.right() || this.right() === area.left())
  {
    return true;
  }

  else return false;
}

prototype.adjacent = function(area)
{
  if (this.xAdjacent(area) === true &&
      ((this.top() >= area.top() && this.top() <= area.bottom()) ||
       (this.bottom() >= area.top() && this.bottom() <= area.bottom())))
  {
    return true;
  }

  else if (this.yAdjacent(area) === true &&
     ((this.left() >= area.left() && this.left() <= area.right()) ||
      (this.right() >= area.left() && this.right() <= area.right())))
  {
    return true;
  }

  else return false;
}

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

prototype.intersection = function(area)
{
  var tilesInside = [];

  this.loopGlobal(function(x, y)
  {
    if (this.contains(x, y) === true)
    {
      tilesInside.push({x: x, y: y});
    }
  });

  return tilesInside;
};

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
