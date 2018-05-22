
var matrix = require("./matrix.js");

if (Number.prototype.toRadians == null && Number.prototype.toDegrees == null)
{
  Number.prototype.toRadians = function(decimals = 2)
  {
  	return ((this * Math.PI) / 180).round(decimals);
  };

  Number.prototype.toDegrees = function(decimals = 2)
  {
  	return ((this * 180) / Math.PI).round(decimals);
  };
}

module.exports =
{
  /******************
  *   PROTOTYPES    *
  ******************/

  Vector: function(p1x, p1y, p2x, p2y)
  {
    var _x = p2.x - p1.x;
    var _y = p2.y - p1.y;
    var _p1 = p1;
    var _p2 = p2;
    var _slope;
    var _yIntercept;
    var _magnitude;
    var _radians;
    var _normal;
    var _orthogonal;

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

    Object.defineProperty(this, "y",
    {
      get: function()
      {
        return _y;
      },
      enumerable: true
    });

    Object.defineProperty(this, "slope",
    {
      get: function()
      {
        if (_slope == null)
        {
          _slope = vectorSlope(this);
        }

        return _slope;
      },
      enumerable: true
    });

    Object.defineProperty(this, "yIntercept",
    {
      get: function()
      {
        var slope = this.slope;

        if (_yIntercept == null)
        {
          _yIntercept = yIntercept(_p1, _slope.value);
        }

        return _yIntercept;
      },
      enumerable: true
    });

    Object.defineProperty(this, "magnitude",
    {
      get: function()
      {
        if (_magnitude == null)
        {
          _magnitude = vectorMagnitude(this);
        }

        return _magnitude;
      },
      enumerable: true
    });

    Object.defineProperty(this, "radians",
    {
      get: function()
      {
        if (_radians == null)
        {
          _radians = vectorRadians(this);
        }

        return _radians;
      },
      enumerable: true
    });

    Object.defineProperty(this, "normal",
    {
      get: function()
      {
        if (_normal == null)
        {
          _normal = vectorNormal(this);
        }

        return _normal;
      },
      enumerable: true
    });

    Object.defineProperty(this, "orthogonal",
    {
      get: function()
      {
        if (_orthogonal == null)
        {
          _orthogonal = vectorOrthogonal(this);
        }

        return _orthogonal;
      },
      enumerable: true
    });
  },

  Circle: function(x, y, radius)
  {
    var _x = x;
    var _y = y;
    var _radius = radius;

    Object.defineProperty(this, "x",
    {
      get: function()
      {
        return _x;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _x = value;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "y",
    {
      get: function()
      {
        return _y;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _y = value;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "radius",
    {
      get: function()
      {
        return _radius;
      },
      enumerable: true
    });

    Object.defineProperty(this, "position",
    {
      get: function()
      {
        return {x: _x, y: _y};
      },
      set: function(value)
      {
        if (value.x != null && isNaN(value.x) === false && value.y != null && isNaN(value.y) === false)
        {
          _x = value.x;
          _y = value.y;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "left",
    {
      get: function()
      {
        return _x - _radius;
      },
      enumerable: true
    });

    Object.defineProperty(this, "right",
    {
      get: function()
      {
        return _x + _radius;
      },
      enumerable: true
    });

    Object.defineProperty(this, "top",
    {
      get: function()
      {
        return _y - _radius;
      },
      enumerable: true
    });

    Object.defineProperty(this, "bottom",
    {
      get: function()
      {
        return _y + _radius;
      },
      enumerable: true
    });
  },

  //Use only if it will not be rotated. Otherwise use polygon-related methods
  Rectangle: function(x, y, width, height)
  {
    var _x = x;
    var _y = y;
    var _width = width;
    var _height = height;
    var _center;
    var _globalCenter;

    Object.defineProperty(this, "x",
    {
      get: function()
      {
        return _x;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _x = value;
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "y",
    {
      get: function()
      {
        return _y;
      },
      set: function(value)
      {
        if (isNaN(value) === false)
        {
          _y = value;
        }
      },
      configurable: true,
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

    Object.defineProperty(this, "position",
    {
      get: function()
      {
        return {x: _x + Math.floor(_width * 0.5), y: _y + Math.floor(_height * 0.5)};
      },
      set: function(value)
      {
        if (value.x != null && isNaN(value.x) === false && value.y != null && isNaN(value.y) === false)
        {
          _center = value;
          _x = _center - Math.floor(_width / 2);
          _y = _center - Math.floor(_height / 2);
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "left",
    {
      get: function()
      {
        return _x;
      },
      enumerable: true
    });

    Object.defineProperty(this, "right",
    {
      get: function()
      {
        return _x + _width;
      },
      enumerable: true
    });

    Object.defineProperty(this, "top",
    {
      get: function()
      {
        return _y;
      },
      enumerable: true
    });

    Object.defineProperty(this, "bottom",
    {
      get: function()
      {
        return _y + _height;
      },
      enumerable: true
    });

    //clears properties that are lazy loaded and that may change if the polygon
    //changes position, so that they are recalculated in their getter next time
    //they are called
    function clearProperties()
    {
      _center = undefined;
      _globalCenter = undefined;
    }
  },

  //vertices must be defined assuming a 0,0 starting cartesian point, not the
  //actual position in a world that the polygon will have (that is the x,y coordinates,
  //which will act as the centroid)
  Polygon: function(vertices, rotation = 0)
  {
    var _rotation = rotation.toRadians();
    var _centroid = getCentroid(vertices);
    var _vertices = vertices;
    var _edges;
    var _edgeVectors;
    var _matrix;
    var _isClockwise;
    var _distanceToFarthestVertex;

    if (rotation != 0)
    {
      _vertices = rotateVertices(_vertices, _rotation, _centroid);
    }

    Object.defineProperty(this, "x",
    {
      get: function()
      {
        return _centroid.x;
      },
      enumerable: true
    });

    Object.defineProperty(this, "y",
    {
      get: function()
      {
        return _centroid.y;
      },
      enumerable: true
    });

    Object.defineProperty(this, "rotation",
    {
      get: function()
      {
        return _rotation;
      },
      enumerable: true
    });

    Object.defineProperty(this, "vertices",
    {
      get: function()
      {
        return _vertices.slice();
      },
      enumerable: true
    });

    Object.defineProperty(this, "edges",
    {
      get: function()
      {
        if (_edges == null)
        {
          var edges = [];

          for (var i = 0; i < _vertices.length; i++)
          {
            edges.push([_vertices[i], _vertices[i+1] || _vertices[0]]);
          }

          _edges = edges;
        }

        return _edges.slice();
      },
      enumerable: true
    });

    Object.defineProperty(this, "edgeVectors",
    {
      get: function()
      {
        if (_edgeVectors == null)
        {
          var vectors = [];
          var edges = this.edges;

          for (var i = 0; i < edges.length; i++)
          {
            vectors.push(new module.exports.Vector(edges[i][0], edges[i][1]));
          }

          _edgeVectors = vectors;
        }

        return _edgeVectors.slice();
      },
      enumerable: true
    });

    Object.defineProperty(this, "matrix",
    {
      get: function()
      {
        if (_matrix == null)
        {
          _matrix = matrix.verticesToMatrix(_vertices);
        }

        return _matrix;
      },
      enumerable: true
    });

    Object.defineProperty(this, "centroid",
    {
      get: function()
      {
        return _centroid;
      },
      set: function(value)
      {
        if (value.x != null && isNaN(value.x) === false && value.y != null && isNaN(value.y) === false)
        {
          _centroid.x = value.x;
          _centroid.y = value.y;
          _vertices = _vertices.forEach(function(vert, index)
          {
            vert.x += _x;
            vert.y += _y;
          });

          clearProperties();
        }
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(this, "isClockwise",
    {
      get: function()
      {
        if (_isClockwise == null)
        {
          _isClockwise = isClockwise(_vertices);
        }

        return _isClockwise;
      },
      enumerable: true
    });

    Object.defineProperty(this, "distanceToFarthestVertex",
    {
      get: function()
      {
        if (_distanceToFarthestVertex == null)
        {
          _distanceToFarthestVertex = distanceToFarthestVertex(_vertices, this.centroid);
        }

        return _distanceToFarthestVertex;
      },
      enumerable: true
    });

    function getCentroid(vertices)
    {
      var xTotal = 0;
      var yTotal = 0;

      for (var i = 0; i < vertices.length; i++)
      {
        xTotal += vertices[i].x;
        yTotal += vertices[i].y;
      }

      return {x: xTotal / vertices.length, y: yTotal / vertices.length};
    }

    function isClockwise(vertices)
    {
      var sum = 0;
    	var sumRounded = 0;

    	for (var i = 0; i < vertices.length - 1; i++)
    	{
    		sum += (vertices[i + 1].x - vertices[i].x) * (vertices[i + 1].y + vertices[i].y);
    	}

    	sum += (vertices[0].x - vertices[vertices.length - 1].x) * (vertices[0].y + vertices[vertices.length - 1].y);

    	if (sum > 0)
    	{
    		return false;
    	}

    	else
    	{
    		return true;
    	}
    }

    function distanceToFarthestVertex(vertices, centroid)
    {
      var finalDistance = 0;

      for (var i = 0; i < vertices.length; i++)
      {
        var unionX = vertices[i].x - centroid.x;
        var unionY = vertices[i].y - centroid.y;
        var distance = vectorMagnitude({x: unionX, y: unionY});

        if (distance > finalDistance)
        {
          finalDistance = distance;
        }
      }

      return finalDistance;
    }

    //clears properties that are lazy loaded and that may change if the polygon
    //changes position, so that they are recalculated in their getter next time
    //they are called
    function clearProperties()
    {
      _edges = undefined;
      _edgeVectors = undefined;
      _matrix = undefined;
    }
  },

  //regular polygon whose first vertex starts at 0,0
  RegularPolygon: function(vertNbr, edgeLength, clockwise = true)
  {
    var vertices = [{x: 0, y: 0}, {x: edgeLength, y: edgeLength}];
  	var outerAngle = 360 / vertNbr;
  	var innerAngle = 180 - outerAngle;

    if (clockwise === true)
    {
      innerAngle = -innerAngle;
    }

    for (var i = 2; i < vertNbr; i++)
    {
      var v = new module.exports.Vector(vertices[i - 1], vertices[i - 2]);
      vertices.push(module.exports.rotateVector(v.p1.x, v.p1.y, v.p2.x, v.p2.y, innerAngle));
    }

    return new module.exports.Polygon(vertices);
  },

  //starts as a regular polygon whose vertices are then randomly perturbed in a given range
  PerturbedPolygon: function(vertNbr, edgeLength, minPert, maxPert, clockwise = true)
  {
    var vertices = [{x: 0, y: 0}, {x: edgeLength, y: edgeLength}];
  	var outerAngle = 360 / vertNbr;
  	var innerAngle = 180 - outerAngle;

    if (clockwise === true)
    {
      innerAngle = -innerAngle;
    }

    for (var i = 2; i < vertNbr; i++)
    {
      var v = new module.exports.Vector(vertices[i - 1], vertices[i - 2]);
      vertices.push(module.exports.rotateVector(v.p1.x, v.p1.y, v.p2.x, v.p2.y, innerAngle));
    }

    for (var i = 0; i < vertNbr; i++)
    {
      vertices[i].x += randomRange(minPert, maxPert);
      vertices[i].y += randomRange(minPert, maxPert);
    }

    return new module.exports.Polygon(vertices);
  },

  /********************
  *   INTERACTIONS    *
  ********************/

  //h and k are the x and y of the circle center
  segmentCircleIntersection: function(vector, circle)
  {
    var slope = this.slope(p2.x - p1.x, p2.y - p1.y).value;
    var yIntercept = this.yIntercept(p1.x, p1.y, slope);

    // circle: (x - h)^2 + (y - k)^2 = r^2
    // line: y = m * x + n
    // r: circle radius
    // h: x value of circle centre
    // k: y value of circle centre
    // m: slope
    // n: y-intercept

    // get a, b, c values of the quadratic formula (https://en.wikipedia.org/wiki/Quadratic_formula)
    var a = 1 + (vector.slope.value * vector.slope.value);
    var b = -circle.x * 2 + (vector.slope.value * (vector.yIntercept - circle.y)) * 2;
    var c = (circle.x * circle.x) + Math.pow(vector.yIntercept - circle.y, 2) - (circle.radius * circle.radius);

    // get discriminant
    var discriminant = (b * b) - 4 * a * c;
    if (discriminant >= 0)
    {
      // insert into quadratic formula
      var intersections =
      [
        (-b + Math.sqrt((b * b) - 4 * a * c)) / (2 * a),
        (-b - Math.sqrt((b * b) - 4 * a * c)) / (2 * a)
      ];

      if (discriminant == 0)
      {
        // only 1 intersection
        return [intersections[0]];
      }

      else return intersections;
    }

    // no intersection
    return [];
  },

  //h and k are x and y of the center of a circle, r is radius
  pointDistanceToRadius: function(px, py, circle)
  {
    this.distanceBetweenPoints(px, py, circle.x, circle.y) - circle.radius;
  },

  isPointInCircle: function(px, py, circle)
  {
    if (this.distanceBetweenPoints(px, py, circle.x, circle.y) <= circle.radius)
    {
      return true;
    }

    else return false;
  },

  isPointInVector: function(px, py, v)
  {
    if (v.p1.x < v.p2.x && (px < v.p1.x || px > v.p2.x))
    {
      return false;
    }

    if (v.p1.x > v.p2.x && (px < v.p2.x || px > v.p1.x))
    {
      return false;
    }

    if (v.p1.y < v.p2.y && (py < v.p1.y || py > v.p2.y))
    {
      return false;
    }

    if (v.p1.y > v.p2.y && (py < v.p2.y || py > v.p1.y))
    {
      return false;
    }

    return true;
  },

  isPointLeftOfLine: function(v, px, py) //is a point left, on or right of a line defined by two points
  {
    var l = (v.p2.x - v.p1.x) * (py - v.p1.y) - (px - v.p1.x) * (v.p2.y - v.p1.y);

    if (l === 0)
    {
      return "edge";
    }

    if (v.p2.y < v.p1.y)
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

    else if (v.p2.y > v.p1.y)
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

    else if (v.p2.x < v.p1.x)
    {
      if (py < v.p1.y)
      {
        return "right";
      }

      else if (py > v.p1.y)
      {
        return "left";
      }
    }

    else if (v.p2.x > v.p1.x)
    {
      if (py < v.p1.y)
      {
        return "left";
      }

      else if (py > v.p1.y)
      {
        return "right";
      }
    }

    else return "error";
  },

  isPointInTriangle: function(p, triangle)
  {
    var v0 = verts[0];
    var v1 = {x: triangle[1].x - triangle[0].x, y: triangle[1].y - triangle[0].y};
    var v2 = {x: triangle[2].x - triangle[0].x, y: triangle[2].y - triangle[0].y};

    var a = (module.exports.determinantOfVectors(p, v2) - module.exports.determinantOfVectors(v0, v2)) / module.exports.determinantOfVectors(v1, v2);
    var b = - ((module.exports.determinantOfVectors(p, v1) - module.exports.determinantOfVectors(v0, v1)) / module.exports.determinantOfVectors(v1, v2));

    if (a > 0 && b > 0 && a + b < 1)
    {
      return true;
    }

    else return false;
  },

  isPointInRectangle: function(px, py, rect)
  {
    if (px >= rect.left && px < rect.right && py >= rect.top && py < rect.bottom)
    {
      return true;
    }

    else return false;
  },

  //The winding algorithm is used. wn will be 0 if point is on an edge,
  //or an odd number if it's inside, or an even number if outside. In this
  //particular implementation, an edge is considered inside. The signs of
  //wn are changed from the Cartesian algorithm since in browsers the Y axis goes
  //downwards instead of upwards
  isPointInPolygon: function(p, polygon)
  {
    var edges = polygon.edges;
    var wn = 0;
    var edgeChecked = false;

    for (var i = 0; i < edges.length; i++)
    {
      if (edges[i][0].y >= point.y && edges[i][1].y < point.y)  //upward crossing, (an upward edge includes its starting endpoint, and excludes its final endpoint IN CARTESIAN COORDINATES)
      {
        var l = vector.isLeft(edges[i][0], edges[i][1], p);
        edgeChecked = true;

        if (l === "right")
        {
          wn++;
        }

        else if (l === "edge")
        {
          //point is on an edge
          return true;
        }
      }

      else if (edges[i][0].y < point.y && edges[i][1].y >= point.y)  //downward crossing, (a downward edge excludes its starting endpoint, and includes its final endpoint)
      {
        var l = vector.isLeft(edges[i][0], edges[i][1], p);
        edgeChecked = true;

        if (l === "right")
        {
          wn--;
        }

        else if (l === "edge")
        {
          //point is on an edge
          return true;
        }
      }
    }

    if (edgeChecked === false)
    {
      return false;
    }

    if (wn === 0)
    {
      return true;
    }

    else return false;
  },

  //Uses the previous winding algorithm to check if at least a vertex is inside
  //one of the polygons and returns true or false
  simplePolygonIntersection: function(polygon, otherPolygon)
  {
    var distance = new module.exports.Vector(polygon.centroid, otherPolygon.centroid).magnitude;
  	var selfVerts = polygon.vertices;
  	var otherVerts = otherPolygon.vertices;

    if (distance > polygon.distanceToFarthestVertex + otherPolygon.distanceToFarthestVertex)
    {
      return false;
    }

  	for (var i = 0; i < selfVerts.length; i++)
  	{
  		if (module.exports.isPointInPolygon(selfVerts[i], otherPolygon) === true)
  		{
  			return true;
  		}
  	}

  	for (var j = 0; j < otherVerts.length; j++)
  	{
  		if (module.exports.isPointInPolygon(otherVerts[j], polygon) === true)
  		{
  			return true;
  		}
  	}

  	return false;
  },

  //Uses the previous winding algorithm to get the vertices that are inside each
  //polygon
  polygonIntersection: function(polygon, otherPolygon)
  {
    var distance = new module.exports.Vector(polygon.centroid, otherPolygon.centroid).magnitude;
  	var selfVerts = polygon.vertices;
  	var otherVerts = otherPolygon.vertices;
  	var polygonVertsInside = [];
  	var otherPolygonVertsInside = [];

    if (distance > polygon.distanceToFarthestVertex + otherPolygon.distanceToFarthestVertex)
    {
      return false;
    }

  	for (var i = 0; i < selfVerts.length; i++)
  	{
  		if (module.exports.isPointInPolygon(selfVerts[i], otherPolygon) === true)
  		{
  			polygonVertsInside.push(selfVerts.length[i]);
  		}
  	}

  	for (var j = 0; j < otherVerts.length; j++)
  	{
  		if (module.exports.isPointInPolygon(otherVerts[j], polygon) === true)
  		{
  			otherPolygonVertsInside.push(otherVerts.length[j]);
  		}
  	}

  	return {selfVerts: polygonVertsInside, otherVerts: otherPolygonVertsInside};
  },

  //Check if polygon 1 is going to collide with polygon 2.
  //The last parameter is the *relative* velocity of the polygons
  //(i.e velocity 1 - velocity 2)

  //Taken from: https://www.codeproject.com/Articles/15573/D-Polygon-Collision-Detection

  /******** The function can be used in the following way:

    Vector polygonATranslation = new Vector();
    PolygonCollisionResult r = PolygonCollision(polygonA, polygonB, velocity);

    if (r.WillIntersect) {
      // Move the polygon by its velocity, then move
      // the polygons appart using the Minimum Translation Vector
      polygonATranslation = velocity + r.MinimumTranslationVector;
    } else {
      // Just move the polygon by its velocity
      polygonATranslation = velocity;
    }

    polygonA.Offset(polygonATranslation);
  ************************************************************************************/

  willPolygonsIntersect: function(gon1, gon2, relVel)
  {
    var verts1 = gon1.vertices;
    var verts2 = gon2.vertices;
    var centroid1 = gon1.centroid;
    var centroid2 = gon2.centroid;
    var edgeVectors = gon1.edgeVectors.concat(gon2.edgeVectors);
    var perpAxis = module.exports.getOrthogonals(edgeVectors);
    var minIntervalDistance = Infinity;
    var translationAxis = {};
    var result = {intersect: true, willIntersect: true, mpv: null};

    //Loop through all the axis perpendicular to each edge
    for (var i = 0; i < perpAxis.length; i++)
    {
      //find the projection of each polygon on said axis using the normals
      var proj1 = module.exports.polygonProjection(perpAxis[i].normal, gon1);
      var proj2 = module.exports.polygonProjection(perpAxis[i].normal, gon2);

      //check the interval distance of both projections
      var distance = intervalDistance(proj1.min, proj1.max, proj2.min, proj2.max);

      //if the projections don't overlap, then there is no *current* intersection between the polyons
      if (distance > 0)
      {
        result.intersect = false;
      }

      //Now to find if the polygons *will* intersect
      //Project the velocity on the current axis
      var velProj = module.exports.dotProduct(perpAxis[i].normal, relVel);

      //Get the projection of polygon 1 during this future movement
      if (velProj < 0)
      {
        proj1.min += velProj;
      }

      else proj1.max += velProj;

      //Do the same interval overlap test as above with the future prediction
      distance = intervalDistance(proj1.min, proj1.max, proj2.min, proj2.max);

      if (distance > 0)
      {
        result.willIntersect = false;
      }

      //If the polygons are not intersecting, nor will they intersect, break the loop
      if (result.intersect === false && result.willIntersect === false)
      {
        break;
      }

      //Check if the current distance is the minimum one.
      //If so store the distance and minIntervalDistance.
      //They will be used to calculate the mpv (minimum push vector)
      distance = Math.abs(distance);

      if (distance < minIntervalDistance)
      {
        minIntervalDistance = distance;
        translationAxis = perpAxis[i].normal;

        var direction = new module.exports.Vector(centroid1, centroid2);

        if (vector.dotProduct(direction, translationAxis) < 0)
        {
          translationAxis.x = -translationAxis.x;
          translationAxis.y = -translationAxis.y;
        }
      }
    }

    //The mpv (minimum push vector) can be used to push the polygons apart if required
    if (result.willIntersect === true)
    {
      result.mpv = {x: translationAxis.x * minIntervalDistance, y: translationAxis.y * minIntervalDistance};
    }

    return result;
  },

  //find the projection of a polygon on an axis defined by a vector
  polygonProjection: function(oVector, polygon)
  {
    var verts = polygon.vertices;
    var min = module.exports.dotProduct(verts[0], oVector);
    var max = min;

    for (var i = 1; i < verts.length; i++)
    {
      var projection = module.exports.dotProduct(verts[i], oVector);

      if (projection < min)
      {
        min = projection;
      }

      else if (projection > max)
      {
        max = projection;
      }
    }

    return {min: min, max: max};
  },

  isCircleInRectangle: function(circle, rect)
  {
    if (circle.left >= rect.left && circle.right <= rect.right &&
        circle.top >= rect.top && circle.bottom <= rect.bottom)
    {
      return false;
    }

    else return true;
  },


  /******************************
  *   LINES/SEGMENTS/VECTORS    *
  ******************************/

  //checks if one of the four points that make two segments are shared
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

  distanceBetweenPoints(p1x, p1y, p2x, p2y)
  {
    var vx = p2x - p1x;
    var vy = p2y - p1y;
    return this.vectorMagnitude(vx, vy);
  },

  getOrthogonals: function(vectors)
  {
    var orthogonals = [];

    for (var i = 0; i < vectors.length; i++)
    {
      orthogonals.push(vectorOrthogonal(vectors[i].x, vectors[i].y));
    }

    return orthogonals;
  },

  rotateVector: function(anchorX, anchorY, otherX, otherY, angle)
  {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = Math.round(100 * ((cos * (otherX - anchorX)) - (sin * (otherY - anchorY)) + anchorX)) / 100,
        ny = Math.round(100 * ((cos * (otherY - anchorY)) + (sin * (otherX - anchorX)) + anchorY)) / 100;
    return {x: nx, y: ny};
  },

  determinantOfVectors: function(v1, v2)
  {
    return (v1.x * v2.y) - (v1.y * v2.x);
  },

  vectorsAreScalar(v1, v2)
  {
    if (v1.x * v2.y === v1.y * v2.x)
    {
      return true;
    }

    else return false;
  },

  segmentIntersection: function(v1, v2)  //intersection point of two segments
  {
    var x;
    var y;

    if (v1.slope.value === v2.slope.value)
    {
      return null;
    }

    x = (v1.yIntercept - v2.yIntercept) / (v2.slope.value - v1.slope.value);
    y = ((v1.yIntercept * v2.slope.value) - (v2.yIntercept * v1.slope.value)) / (v2.slope.value - v1.slope.value);

    if (module.exports.isPointInSegment(x, y, v1.p1.x, v1.p1.y, v1.p2.x, v1.p2.y) === false)
    {
      return null;
    }

    if (module.exports.isPointInSegment(x, y, v2.p1x, v2.p1.y, v2.p2.x, v2.p2.y) === false)
    {
      return null;
    }

    return {x: x, y: y};
  },

  dotProduct: function(v1, v2)
  {
    return (v1.x * v2.x) + (v1.y * v2.y);
  },

  degreesBetween: function(v1, v2)
  {
    var dotProduct = module.exports.dotProduct(v1.x, v1.y, v2.x, v2.y);
  	var radians = Math.cos(dotProduct / (v1.magnitude * v2.magnitude));
  	return radians.toDegrees();
  },


  /**************
  *   CIRCLES   *
  **************/

  distanceBetweenRadiuses: function(c1, c2)
  {
    return this.distanceBetweenPoints(c1.x, c1.y, c2.x, c2.y) - c1.radius - c2.radius;
  },


  /****************************
  *   NON-ROTATED RECTANGLES  *
  ****************************/

  //rectangles are expressed by a top left corner (x, y) and a width and height
  distanceBetweenRectangles: function(r1, r2)
  {
    var vx;
    var vy;

    if (r1.right <= r2.left)
    {
      vx = r2.left - r1.right;
    }

    else vx = r1.left - r2.right;

    if (r1.bottom <= r2.top)
    {
      vy = r2.top - r1.bottom;
    }

    else vy = r1.top - r2.bottom;

    return magnitude(vx, vy);
  },

  rectangleIsInsideRectangle: function(r1, r2)
  {
    if (r2.left >= r1.left && r2.right < r1.right &&
        r2.top >= r1.top && r2.bottom < r1.bottom)
    {
      return true;
    }

    else return false;
  },


  /****************
  *   POLYGONS    *
  ****************/

  //Follows the formula:
  //  new Poly = rotationMatrix * (vertMatrix - centroidMatrix) + centroidMatrix
  //https://math.stackexchange.com/questions/1917449/rotate-polygon-around-center-and-get-the-coordinates
  rotateVertices: function(vertices, angle, centroid)
  {
    var centroidArr = [[], []];
    var vertMatrix = matrix.verticesToMatrix(vertices);
    var centroidMatrix;
    var rotationMatrix;

    rotationMatrix = new matrix.create([ [Math.cos(angle), -Math.sin(angle)],
                                    [Math.sin(angle), Math.cos(angle)]  ]);

    for (var i = 0; i < vertices.length; i++)
    {
      centroidArr[0].push(centroid.x);
      centroidArr[1].push(centroid.y);
    }

    centroidMatrix = new matrix.create(centroidArr);
    return matrix.matrixToVertices(rotationMatrix.multiply(vertMatrix.subtract(centroidMatrix)).add(centroidMatrix));
  },


}


/**********************
*   MODULE METHODS    *
**********************/

function vectorSlope(v)
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

    else if (v.y > 0)
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
}

function vectorRadians(v)
{
  if (v.slope.direction === "north")
  {
    return 4.71;
  }

  else if (v.slope.direction === "south")
  {
    return 1.57;
  }

  else if (v.slope.direction === "east")
  {
    return 0;
  }

  else if (v.slope.direction === "west")
  {
    return 3.14;
  }

  else if (v.slope.direction === "southwest" || v.slope.direction === "northwest")
  {
    return 3.14 + Math.atan(v.slope.value);
  }

  else if (v.slope.direction === "northeast")
  {
    return 6.28 + Math.atan(v.slope.value);
  }

  else
  {
    return Math.atan(v.slope.value);
  }
}

function yIntercept(p, slope)
{
  return p.y - (slope * p.x);
}

function vectorMagnitude(v)  //length
{
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

//unit vector
function vectorNormal(v) //unit vector
{
  var magnitude = this.magnitude(vx, vy);
  var normal = {x: vx / magnitude, y: vy / magnitude};
  return new module.exports.Vector(v.p1, {x: v.p1.x + normal.x, y: v.p1.y + normal.y});
}

//perpendicular vector
function vectorOrthogonal(v)
{
  var orthogonal = {x: -v.y, y: v.x};
  return new module.exports.Vector(v.p1, {x: v.p1.x + orthogonal.x, y: v.p1.y + orthogonal.y});
}

//the distance or overlap between two intervals (like projections of polygons in an axis)
//supports the willPolygonsIntersect method
function intervalDistance(minA, maxA, minB, maxB)
{
  if (minA < minB)
  {
    return minB - maxA;
  }

  else return minA - maxB;
}

function randomRange(min, max)
{
  return Math.floor(Math.random() * (max - min)) + min;
}
