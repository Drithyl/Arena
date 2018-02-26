

module.exports =
{
  create: function(x1, x2, y1, y2)
  {
    var obj = {};
    obj.x1 = x1;
    obj.x2 = x2;
    obj.y1 = y1;
    obj.y2 = y2;

    obj.contains = function(x, y)
    {
      if ((x >= this.x1 && x <= this.x2) || ( x >= this.x2 && x <= this.x1))
      {
        if ((y >= this.y1 && y <= this.y2) || ( y >= this.y2 && x <= this.y1))
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
