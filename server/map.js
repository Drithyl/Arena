
var geometry = require("./math/geometry.js");
var prototype;

module.exports =
{
  RectangularMap: function(x, y, width, height, characters)
  {
    /**********************
    *   PRIVATE members   *
    **********************/

    var _x = x;
    var _y = y;
    var _width = width;
    var _height = height;
    var _rectangle = new geometry.Rectangle(_x, _y, _width, _height);
    var _characters = {};
    var _characterAreas = {};
    var _deploymentAreas = {};
    var _lastMovements = {};

    /********************
    *   INITIALIZATION  *
    ********************/

    for (var i = 0; i > characters.length; i++)
    {
      var area = new geometry.Circle(0, 0, characters[i].size);
      _characterAreas[characters[i].id] = area;
      _characters[characters[i].id] = characters[i];
    }


    /**************************
    *   GETTERS AND SETTERS   *
    **************************/

    Object.defineProperty(this, "x",
    {
      get: function()
      {
        return _x;
      },
      enumerable: true
    });

    Object.defineProperty(this, "y",
    {
      get: function()
      {
        return _y;
      },
      enumerable: true
    });

    Object.defineProperty(this, "width",
    {
      get: function()
      {
        return _width;
      },
      enumerable: true
    });

    Object.defineProperty(this, "height",
    {
      get: function()
      {
        return _height;
      },
      enumerable: true
    });


    /**************************
    *   PRIVILEDGED METHODS   *
    **************************/

    this.getLastMovements = function(id)
    {
      var movements = Object.assign({}, _lastMovements[id]);
      delete _lastMovements[id];
      return movements;
    }

    this.setDeploymentArea = function(key, x, y, width, height)
    {
      var rectArea;

      if (Number.isInteger(x) === true || Number.isInteger(y) === true || Number.isInteger(width) === true || Number.isInteger(height) === true)
      {
        throw new Error("x, y, width and height must be integers.");
      }

      rectArea = new geometry.Rectangle(x, y, width, height);

      if (geometry.rectangleIsInsideRectangle(rectArea, _rectangle) === false)
      {
        throw new Error("The deployment area's position must be within the boundaries of the map.");
      }

      _deploymentAreas[key] = rectArea;
    };

    this.getDeploymentArea = function(key)
    {
      var a = _deploymentAreas[key];

      if (a == null)
      {
        throw new Error("The deployment area could not be found.");
      }

      return {x: a.x, y: a.y, width: a.width, height: a.height};
    }

    this.deployCharacter = function(areaKey, characterID, position)
    {
      var characterArea = _characterAreas[characterID];

      if (_deploymentAreas[areaKey] == null)
      {
        throw new Error("Could not find this deployment area.");
      }

      if ( _characters[characterID] == null)
      {
        throw new Error("Could not find this character.");
      }

      if (geometry.isCircleInRectangle(characterArea, _deploymentAreas[areaKey]) === false)
      {
        throw new Error("Character is out of bounds");
      }

      this.setCharacterPosition(position, characterID);
    };

    this.setCharacterPosition = function(p, id)
    {
      _characterAreas[id].x = p.x;
      _characterAreas[id].y = p.y;
      _lastMovements[id] = p;
    }

    this.getCharacterPosition = function(id)
    {
      return _characterAreas[id].position;
    }

    this.getCharacterAt = function(p)
    {
      for (var id in _characters)
      {;
        if (geometry.isPointInCircle(p.x, p.y, _characterAreas[id]) === true)
        {
          return _characters[id];
        }
      }

      return null;
    };

    this.getCharactersInLine = function(p1, p2)
    {
      var line = new geometry.Vector(p1, p2);
      var characters = [];

      for (var id in _characters)
      {
        var intersections = geometry.segmentCircleIntersection(line, _characterAreas[id]);

        if (intersections.length > 0)
        {
          characters.push(_characters[id]);
        }
      }

      if (characters.length > 0)
      {
        characters.sort(function(a, b)
        {
          var areaA = _characterAreas[a.id];
          var areaB = _characterAreas[b.id];
          return geometry.distanceBetweenPoints(p1.x, p1.y, areaA.x, areaA.y) - geometry.distanceBetweenPoints(p1.x, p1.y, areaB.x, areaB.y);
        });
      }

      return characters;
    };

    this.getCharactersWithin = function(p, radius)
    {
      var arr = [];
      var area = new geometry.Circle(p.x, p.y, radius);

      for (var id in _characters)
      {
        var charArea = _characterAreas[id];

        if (geometry.isPointInCircle(charArea.x, charArea.y, area) === true)
        {
          arr.push(_characters[id]);
        }
      }

      return arr;
    };

    this.separateMovingCharacter = function(originalPosition, targetPosition, movingCharacterID, otherCharacterID)
    {
      //the axis along which the character is moving (the normal or unit of the movement vector)
      var movementAxis = new geometry.Vector(originalPosition, targetPosition).normal;

      //the character areas (circles)
      var movingCharacterArea = _characterAreas[movingCharacterID];
      var otherCharacterArea = _characterAreas[otherCharacterID];

      //the distance between both centers taking the radiuses into account. If negative then
      //they are intersecting and the moving character must be pulled back
      var radiusDistance = geometry.distanceBetweenRadiuses(movingCharacterArea, otherCharacterArea);

      if (radiusDistance > 0)
      {
        return;
      }

      //the minimum push vector is the minimum distance that the moving character has to be
      //pushed back so they don't intersect. It uses the negative (opposite) of the movementAxis
      var mpv = {x: - (movementAxis.x * radiusUnion), y: - (movementAxis.y * radiusUnion)};

      var oldPosition = this.getCharacterPosition(movingCharacterID);
      var newPosition = {x: oldPosition.x + mpv.x, y: oldPosition.y + mpv.y};
      this.setCharacterPosition(newPosition, movingCharacterID);
    };

    this.isOccupied = function(charID)
    {
      var area = _characterAreas[charID];

      for (var id in _characters)
      {
        var otherArea = _characterAreas[id];
        var distance = geometry.distanceBetweenRadiuses(area, otherArea);

        if (distance < 0 && id != charID)
        {
          return true;
        }
      }

      return false;
    };

    this.isCharacterOutOfBounds = function(id)
    {
      var area = _characterAreas[id];
      return !geometry.isCircleInRectangle(area, _rectangle);
    };

    this.isPointOutOfBounds = function(p)
    {
      return !geometry.isPointInRectangle(p.x, p.y, _rectangle);
    }

    this.distanceToReach(id, otherID)
    {
      var area = _characterAreas[id];
      var otherArea = _characterAreas[otherID];

      return geometry.pointDistanceToRadius(otherArea.x, otherArea.y, area);
    };

    this.getNearbyCharacters = function(characterID, radius)
    {
      return this.getCharactersWithin(_characterAreas[characterID].position, radius).filter(function(character)
      {
        return (character.id != characterID);
      });
    };

    this.getOppositeAdjacentCharacters = function(id, otherID, reach)
    {
      var area = _characterAreas[id];
      var otherArea = _characterAreas[otherID];
      var union = new geometry.Vector(area.x, area.y, otherArea.x, otherArea.y);
      var oppositePoint = {x: otherArea.x + (union.unit.x * otherArea.radius) + (union.unit.x * area.radius),
                           y: otherArea.y + (union.unit.y * otherArea.radius) + (union.unit.y * area.radius)};

      return this.getCharactersWithin(oppositePoint, area.radius).filter(function(char)
      {
        var charArea = _characterAreas[char.id];
        return geometry.pointDistanceToRadius(charArea.x, charArea.y, area) <= reach;
      });
    };

    this.getSideAdjacentCharacters = function(id, otherID, reach)
    {
      var area = _characterAreas[id];
      var otherArea = _characterAreas[otherID];
      var union = new geometry.Vector(area.x, area.y, otherArea.x, otherArea.y);
      var unitPerpendicular = union.orthogonal.unit;
      var leftUnit = {x: -unitPerpendicular.x, y: -unitPerpendicular.y};
      var leftAdjacentPoint = {x: otherArea.x + (leftUnit.x * otherArea.radius) + (leftUnit.x * area.radius),
                               y: otherArea.y + (leftUnit.y * otherArea.radius) + (leftUnit.y * area.radius)};
      var rightAdjacentPoint = {x: otherArea.x + (unitPerpendicular.x * otherArea.radius) + (unitPerpendicular.x * area.radius),
                               y: otherArea.y + (unitPerpendicular.y * otherArea.radius) + (unitPerpendicular.y * area.radius)};

      return this.getCharactersWithin(leftAdjacentPoint, area.radius).concat(this.getCharactersWithin(rightAdjacentPoint, area.radius)).filter(function(char)
      {
        var charArea = _characterAreas[char.id];
        return geometry.pointDistanceToRadius(charArea.x, charArea.y, area) <= reach;
      });
    };
  }
}

prototype = module.exports.RectangularMap.prototype;

/**********************
*   PUBLIC METHODS    *
**********************/
