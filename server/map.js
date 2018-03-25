
var circle = require("./math/circle.js");
var prototype;

module.exports =
{
  create: function(width, height)
  {
    this.width = width;
    this.height = height;
    this.characters = [];
  }
}

prototype = module.exports.create.prototype;

prototype.getCharacterAt = function(p)
{
  for (var i = 0; i < this.characters.length; i++)
  {
    if (this.characters[i].area.containsPoint(p) === true)
    {
      return this.characters[i];
    }
  }

  return null;
}

prototype.getCharactersWithin = function(p, radius)
{
  var arr = [];
  var area = circle.create(p.x, p.y, radius);

  for (var i = 0; i < this.characters.length; i++)
  {
    if (area.containsPoint(this.characters[i].area.position()) === true)
    {
      arr.push(this.characters[i]);
    }
  }

  return arr;
};

prototype.getOppositeAdjacentCharacters = function(characterCircle, otherCircle)
{
  var union = {x: otherCircle.x - circle.x, y: otherCircle.y - circle.y};
  var unitVector = vector.normal(union);
  var oppositePoint = {x: otherCircle.x + (unitVector.x * otherCircle.radius) + (unitVector.x * characterCircle.radius),
                       y: otherCircle.y + (unitVector.y * otherCircle.radius) + (unitVector.y * characterCircle.radius)};

  return this.getCharactersWithin(oppositePoint, characterCircle.radius);
};

prototype.getSideAdjacentCharacters = function(characterCircle, otherCircle)
{
  var union = {x: otherCircle.x - circle.x, y: otherCircle.y - circle.y};
  var unitPerpendicular = vector.orthogonal(vector.normal(union));
  var leftUnit = {x: -unitPerpendicular.x, y: -unitPerpendicular.y};
  var leftAdjacentPoint = {x: otherCircle.x + (leftUnit.x * otherCircle.radius) + (leftUnit.x * characterCircle.radius),
                           y: otherCircle.y + (leftUnit.y * otherCircle.radius) + (leftUnit.y * characterCircle.radius)};
  var rightAdjacentPoint = {x: otherCircle.x + (unitPerpendicular.x * otherCircle.radius) + (unitPerpendicular.x * characterCircle.radius),
                           y: otherCircle.y + (unitPerpendicular.y * otherCircle.radius) + (unitPerpendicular.y * characterCircle.radius)};

  return this.getCharactersWithin(leftAdjacentPoint, characterCircle.radius).concat(this.getCharactersWithin(rightAdjacentPoint, characterCircle.radius));
};

prototype.isOccupied = function(circle, id)
{
  for (var i = 0; i < this.characters.length; i++)
  {
    var distance = circle.distance(this.characters[i].area);

    if (distance < 0 && this.characters[i].id != id)
    {
      return true;
    }
  }

  return false;
}

prototype.isOutOfBounds = function(circle)
{
  if (circle.left() >= 0 && circle.right() <= this.width &&
      circle.top() >= 0 && circle.bottom() <= this.height)
  {
    return false;
  }

  else return true;
};
