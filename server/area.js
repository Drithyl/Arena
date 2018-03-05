

module.exports =
{
  create: function(xStart, xEnd, yStart, yEnd)
  {
    var obj = {};
    obj.xStart = xStart;
    obj.xEnd = xEnd;
    obj.yStart = yStart;
    obj.yEnd = yEnd;

    obj.contains = function(x, y)
    {
      if ((x >= this.xStart && x <= this.xEnd) || ( x >= this.xEnd && x <= this.xStart))
      {
        if ((y >= this.yStart && y <= this.yEnd) || ( y >= this.yEnd && x <= this.yStart))
        {
          return true;
        }
      }

      return false;
    };
  },

  map: function(width, height)
  {
    var map = {width: width, height: height, tiles: []};

    for (var x = 0; x < width; x++)
    {
      map.tiles.push([]);

      for (var y = 0; y < height; y++)
      {
        map.tiles[i].push({terrain: null, actor: null, position: {"x": x, "y": y}});
      }
    }

    map.nextTo = function(p, radius = 1)
    {
      var arr = [];

      for (var x = 0; x < this.tiles.length; x++)
      {
        for (var y = 0; y < this.tiles[x].length; y++)
        {
          var distance = this.distance(p, {"x": x, "y": y});

          if (distance <= radius && distance > 0)
          {
            arr.push({tile: this.tiles[x][y], "distance": distance});
          }
        }
      }

      return arr;
    }

    //TODO: map.actors = function()

    return map;
  },

  isAdjacent: function(p1, p2)
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
