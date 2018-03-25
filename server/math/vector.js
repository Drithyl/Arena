
var point = require("./point.js");

module.exports =
{
  create: function(p1, p2)
  {
    this.x = p2.x - p1.x;
    this.y = p2.y - p1.y;
    this.p1 = p1;
    this.p2 = p2;
    this.slope = this.slope(self);
    this.yIntercept = module.exports.yIntercept(this.p1, this.slope.value);
    this.magnitude = module.exports.magnitude(self);
    this.radians = module.exports.radians(this.slope);
    this.degrees = module.exports.degrees(this.slope);
  },

  slope: function(v)
  {
    if (v.x === 0)
    {
      if (v.y > 0)
      {
        return {value: Infinity, direction: "south"};
      }

      else if (v.y < 0)
      {
        return {value: Infinity, direction: "north"};
      }

      else return {value: null, direction: null};
    }

    else if (v.y === 0)
    {
      if (v.x < 0)
      {
        return {value: 0, direction: "west"};
      }

      else if (v.x > 0)
      {
        return {value: 0, direction: "east"};
      }
    }

    else if (v.x < 0 && v.y < 0)
    {
      return {value: v.y / v.x, direction: "northwest"};
    }

    else if (v.x > 0 && v.y < 0)
    {
      return {value: v.y / v.x, direction: "northeast"};
    }

    else if (v.x < 0 && v.y > 0)
    {
      return {value: v.y / v.x, direction: "southwest"};
    }

    else if (v.x > 0 && v.y > 0)
    {
      return {value: v.y / v.x, direction: "southeast"};
    }

    else
    {
      console.log("an error occurred here, the vector given that didn't match any condition was: ");
      console.log(v);
    }
  },

  degrees: function(slope)
  {
    if (slope.direction === "north")
  	{
  		return 270;
  	}

  	else if (slope.direction === "south")
  	{
  		return 90;
  	}

  	else if (slope.direction === "east")
  	{
  		return 0;
  	}

  	else if (slope.direction === "west")
  	{
  		return 180;
  	}

  	else if (slope.direction === "southwest" || slope.direction === "northwest")
  	{
  		return 180 + Math.atan(slope.value).toDegrees(2);
  	}

  	else if (slope.direction === "northeast")
  	{
  		return 360 + Math.atan(slope.value).toDegrees(2);
  	}

  	else
  	{
  		return Math.atan(slope.value).toDegrees(2);
  	}
  },

  radians: function(slope)
  {
    if (slope.direction === "north")
  	{
  		return 4.71;
  	}

  	else if (slope.direction === "south")
  	{
  		return 1.57;
  	}

  	else if (slope.direction === "east")
  	{
  		return 0;
  	}

  	else if (slope.direction === "west")
  	{
  		return 3.14;
  	}

  	else if (slope.direction === "southwest" || slope.direction === "northwest")
  	{
  		return 3.14 + Math.atan(slope.value);
  	}

  	else if (slope.direction === "northeast")
  	{
  		return 6.28 + Math.atan(slope.value);
  	}

  	else
  	{
  		return Math.atan(slope.value);
  	}
  },

  /*angle: function(v)
  {
    return Math.atan2(v.x, -v.y);
  },*/

  magnitude: function(v)  //length
  {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  distance: function(p1, p2)
  {
    var v = point.fromCoords(p2.x - p1.x, p2.y - p1.y);
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  normal: function(v) //unit vector
  {
    var magnitude = module.exports.magnitude(v);
    return point.fromCoords(v.x / magnitude, v.y / magnitude);
  },

  orthogonal: function(v) //perpendicular vector
  {
    return point.fromCoords(-v.y, v.x);
  },

  getOrthogonals: function(vectors)
  {
    var orthogonals = [];

    for (var i = 0; i < vectors.length; i++)
    {
      orthogonals.push(module.exports.orthogonal(vectors[i]));
    }

    return orthogonals;
  },

  intervalDistance: function(minA, maxA, minB, maxB)  //the distance or overlap between two intervals (projections of polygons in an axis)
  {
    if (minA < minB)
    {
      return minB - maxA;
    }

    else return minA - maxB;
  },

  rotate: function(anchor, p, angle)
  {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = Math.round(100 * ((cos * (p.x - anchor.x)) - (sin * (p.y - anchor.y)) + anchor.x)) / 100,
        ny = Math.round(100 * ((cos * (p.y - anchor.y)) + (sin * (p.x - anchor.x)) + anchor.y)) / 100;
    return point.fromCoords(nx, ny);
  },

  determinant: function(v1, v2)
  {
    return (v1.x * v2.y) - (v1.y * v2.x);
  },

  isScalar: function(v1, v2)  //is same direction but different length
  {
    if (v1.x * v2.y === v1.y * v2.x)
    {
      return true;
    }

    else return false;
  },

  yIntercept: function(p, m)  //the point at which a line crosses the y axis
  {
    return p.y - (m * p.x);
  },

  //checks if one of the two points that make a vector are shared
  sharedPoint: function(v1, v2)
  {
    if ((v1.p1.x === v2.p1.x && v1.p1.y === v2.p1.y) ||
        (v1.p1.x === v2.p2.x && v1.p1.y === v2.p2.y))
    {
      return v1.p1;
    }

    else if ((v1.p2.x === v2.p1.x && v1.p2.y === v2.p1.y) ||
             (v1.p2.x === v2.p2.x && v1.p2.y === v2.p2.y))
    {
      return v1.p2;
    }

    else
    {
      return null;
    }
  },

  isPointInSegment: function(p, p1, p2)
  {
    if (p1.x < p2.x && (p.x < p1.x || p.x > p2.x))
    {
      return false;
    }

    if (p1.x > p2.x && (p.x < p2.x || p.x > p1.x))
    {
      return false;
    }

    if (p1.y < p2.y && (p.y < p1.y || p.y > p2.y))
    {
      return false;
    }

    if (p1.y > p2.y && (p.y < p2.y || p.y > p1.y))
    {
      return false;
    }

    return true;
  },

  intersection: function(v1, v2)  //intersection point of two vectors
  {
    var x;
    var y;

    if (v1.slope.value === v2.slope.value)
    {
      return null;
    }

    x = (v1.yIntercept - v2.yIntercept) / (v2.slope.value - v1.slope.value);
    y = ((v1.yIntercept * v2.slope.value) - (v2.yIntercept * v1.slope.value)) / (v2.slope.value - v1.slope.value);

    /*console.log("\n\nChecking intersection between vector 1:");
    console.log(v1);
    console.log("\n\nand vector 2:");
    console.log(v2);*/

    if (module.exports.isPointInSegment(point.fromCoords(x, y), v1.p1, v1.p2) === false)
    {
      return null;
    }

    if (module.exports.isPointInSegment(point.fromCoords(x, y), v2.p1, v2.p2) === false)
    {
      return null;
    }

    //console.log("\n\nIntersection found at " + x + "," + y + ".");

    return point.fromCoords(x, y);
  },

  angleFormed: function(v1, v2)
  {
    var dotProduct = module.exports.dotProduct(v1, v2);
  	var radians = Math.cos(dotProduct / (v1.magnitude * v2.magnitude));
  	return (radians * 180) / Math.PI;
  },

  dotProduct: function(v1, v2)
  {
    return (v1.x * v2.x) + (v1.y * v2.y);
  },

  fromEdge: function(edge)  //create a vector from a polygon edge
  {
    return point.fromCoords(edge[1].x - edge[0].x, edge[1].y - edge[0].y);
  },

  isLeft: function(p0, p1, p) //is a point left, on or right of a line
  {
    var l = (p1.x - p0.x) * (p.y - p0.y) - (p.x - p0.x) * (p1.y - p0.y);

    if (l === 0)
    {
      return "edge";
    }

    if (p1.y < p0.y)
    {
      if (l < 0)
      {
        return "left";
      }

      else if (l > 0)
      {
        return "right";
      }
    }

    else if (p1.y > p0.y)
    {
      if (l < 0)
      {
        return "left";
      }

      else if (l > 0)
      {
        return "right";
      }
    }

    else if (p1.x < p0.x)
    {
      if (p.y < p0.y)
      {
        return "right";
      }

      else if (p.y > p0.y)
      {
        return "left";
      }
    }

    else if (p1.x > p0.x)
    {
      if (p.y < p0.y)
      {
        return "left";
      }

      else if (p.y > p0.y)
      {
        return "right";
      }
    }

    else return "error";
  }
}
