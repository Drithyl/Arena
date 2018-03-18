
var prototype;

module.exports =
{
  Map: function(width, height)
  {
    this.width = width;
    this.height = height;
    this.tiles = [];

    for (var x = 0; x < this.width; x++)
    {
      this.tiles.push([]);

      for (var y = 0; y < this.height; y++)
      {
        this.tiles[i].push({terrain: null, character: null, position: {"x": x, "y": y}});
      }
    }

    return this;
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

prototype = module.exports.Map.prototype;

prototype.nextTo = function(p, radius = 1)
{
  var arr = [];

  for (var x = 0; x < this.tiles.length; x++)
  {
    for (var y = 0; y < this.tiles[x].length; y++)
    {
      var distance = module.exports.distance(p, {"x": x, "y": y});

      if (distance <= radius && distance > 0)
      {
        arr.push({tile: this.tiles[x][y], "distance": distance});
      }
    }
  }

  return arr;
};

prototype.assignPosition = function(character, area)
{
  for (var x = 0; x < this.width; x++)
  {
    for (var y = 0; y < this.height; y++)
    {
      if (this[x][y].character.id === character.id)
      {
        delete this[x][y].character;
      }

      if (x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height)
      {
        this[x][y].character = character;
      }
    }
  }
}

prototype.isOccupied = function(area, id)
{
  for (var i = 0; i < area.width; i++)
  {
    for (var j = 0; j < area.height; j++)
    {
      if (this[i + area.x][j + area.y].character.id != id)
      {
        return true;
      }
    }
  }

  return false;
}

prototype.isOutOfBounds = function(area)
{
  for (var i = 0; i < area.width; i++)
  {
    for (var j = 0; j < area.height; j++)
    {
      if (i + area.x < this.width || i + area.x >= this.width ||
          j + area.y < this.height || j + area.y >= this.height)
      {
        return true;
      }
    }
  }

  return false;
};

prototype.getCharactersAt = function(area)
{
  var characters = [];
  var charactersAdded = [];

  for (var i = 0; i < area.width; i++)
  {
    for (var j = 0; j < area.height; j++)
    {
      if (this[i + area.x][j + area.y].character != null)
      {
        var character = this[i + area.x][j + area.y].character;

        if (charactersAdded.includes(character.id) === false)
        {
          characters.push(character);
          charactersAdded.push(character.id);
        }
      }
    }
  }

  return characters;
}

prototype.getHorizontalAdjacentCharacters = function(area)
{
  var adjacents = [];
  var xLeft = area.left() - 1;
  var xRight = area.right() + 1;

  for (var i = 0; i < area.height; i++)
  {
    var yCurrent = area.y + i;

    if (xLeft >= 0 && this.tiles[xLeft][yCurrent].character != null)
    {
      adjacents.push(this.tiles[xLeft][yCurrent].character);
    }

    if (xRight < this.width && this.tiles[xRight][yCurrent].character != null)
    {
      adjacents.push(this.tiles[xRight][yCurrent].character);
    }
  }

  return adjacents;
}

prototype.getVerticalAdjacentCharacters = function(area)
{
  var adjacents = [];
  var yTop = area.top() - 1;
  var yBottom = area.bottom() + 1;

  for (var i = 0; i < area.width; i++)
  {
    var xCurrent = area.x + i;

    if (yTop >= 0 && this.tiles[yTop][xCurrent].character != null)
    {
      adjacents.push(this.tiles[yTop][xCurrent].character);
    }

    if (yBottom < this.height && this.tiles[yBottom][xCurrent].character != null)
    {
      adjacents.push(this.tiles[yBottom][xCurrent].character);
    }
  }

  return adjacents;
}
