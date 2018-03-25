
var point = require("./point.js");
var vector = require("./vector.js");
var matrix = require("./matrix.js");

module.exports =
{
  create: function(vertices, pos, rotation = 0)
  {
    this.position = pos;
    this.vertices = (rotation === 0) ? vertices : module.exports.rotateVertices(vertices, rotation);
    this.matrix = module.exports.verticesToMatrix(this.vertices);
    this.centroid = module.exports.getCentroid(this.vertices);
    this.clockwise = module.exports.isClockwise(this.vertices);
    this.distanceToFarthestVertex = module.exports.distanceToFarthestVertex(this.vertices, this.centroid);
    /*self.triangles = this.triangulate(self);
    console.log("self.triangles:");
    console.log(self.triangles);
    console.log("\n\n\n");*/
  },

  verticesToMatrix: function(vertices)
  {
    var vertArr = [[], []];

    for (var i = 0; i < vertices.length; i++)
    {
      vertArr[0].push(vertices[i].x);
      vertArr[1].push(vertices[i].y);
    }

    return new matrix.create(vertArr);
  },

  matrixToVertices: function(vertMatrix)
  {
    var vertices = [];

    for (var i = 0; i < vertMatrix.content[0].length; i++)
    {
      vertices.push(point.fromCoords(vertMatrix.content[0][i], vertMatrix.content[1][i]));
    }

    return vertices;
  },

  getCentroid: function(vertices)
  {
    var xTotal = 0;
    var yTotal = 0;

    for (var i = 0; i < vertices.length; i++)
    {
      xTotal += vertices[i].x;
      yTotal += vertices[i].y;
    }

    return point.fromCoords(xTotal / vertices.length, yTotal / vertices.length);
  },

  distanceToFarthestVertex: function(vertices, centroid)
  {
    var distance = 0;

    for (var i = 0; i < vertices.length; i++)
    {
      var union = point.fromCoords(vertices[i].x - centroid.x, vertices[i].y - centroid.y);
      var tempDistance = Math.sqrt(union.x * union.x + union.y * union.y);

      if (tempDistance > distance)
      {
        distance = tempDistance;
      }
    }

    return distance;
  },

  isClockwise: function(vertices)
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
  },

  //Follows the formula:
  //  new Poly = rotationMatrix * (vertMatrix - centroidMatrix) + centroidMatrix
  //https://math.stackexchange.com/questions/1917449/rotate-polygon-around-center-and-get-the-coordinates
  rotateVertices: function(vertices, angle, centroid = null, inRadians = true)
  {
    var centroidArr = [[], []];
    var vertMatrix = module.exports.verticesToMatrix(vertices);
    var centroidMatrix;
    var rotationMatrix;

    if (centroid == null)
    {
      centroid = module.exports.getCentroid(vertices);
    }

    if (inRadians === false)
    {
      angle = angle.toRadians(2);
    }

    rotationMatrix = new matrix.create([ [Math.cos(angle), -Math.sin(angle)],
                                    [Math.sin(angle), Math.cos(angle)]  ]);

    for (var i = 0; i < vertices.length; i++)
    {
      centroidArr[0].push(centroid.x);
      centroidArr[1].push(centroid.y);
    }

    centroidMatrix = new matrix.create(centroidArr);
    return module.exports.matrixToVertices(rotationMatrix.multiply(vertMatrix.subtract(centroidMatrix)).add(centroidMatrix));
  },

  rotatePolygon: function(gon, angle, centroid = null, inRadians = true)
  {
    var centroidArr = [[], []];
    var centroidMatrix;
    var rotationMatrix;

    if (centroid == null)
    {
      centroid = gon.centroid;
    }

    if (inRadians === false)
    {
      angle = angle.toRadians(2);
    }

    rotationMatrix = new matrix.create([ [Math.cos(angle), -Math.sin(angle)],
                                    [Math.sin(angle), Math.cos(angle)]  ]);

    for (var i = 0; i < gon.vertices.length; i++)
    {
      centroidArr[0].push(gon.centroid.x);
      centroidArr[1].push(gon.centroid.y);
    }

    centroidMatrix = new matrix.create(centroidArr);

    gon.matrix = rotationMatrix.multiply(gon.matrix.subtract(centroidMatrix)).add(centroidMatrix);
    gon.vertices = module.exports.matrixToVertices(gon.matrix);
  },

  rotateVertexMatrix: function(vertMatrix, angle, centroid = null, inRadians = true)
  {
    var centroidArr = [[]];
    var centroidMatrix;
    var rotationMatrix;

    if (centroid == null)
    {
      centroid = module.exports.getCentroid(module.exports.matrixToVertices(vertMatrix));
    }

    if (inRadians === false)
    {
      angle = angle.toRadians(2);
    }

    rotationMatrix = new matrix.create([ [Math.cos(angle), -Math.sin(angle)],
                                    [Math.sin(angle), Math.cos(angle)]  ]);

    for (var i = 0; i < vertices.length; i++)
    {
      centroidArr[0].push(centroid.x);
      centroidArr[1].push(centroid.y);
    }

    centroidMatrix = new matrix.create(centroidArr);

    return rotationMatrix.multiply(vertMatrix.subtract(centroidMatrix)).add(centroidMatrix);
  },


  //returns 0 if point is on an edge, odd number if it's inside, and even number if outside
  //The signs of the wn are changed from the Cartesian algorithm since in HTML the Y axis goes
  //downwards instead of upwards
  isPointInPolygon: function(p, vertices)
  {
    var edges = polygon.getEdges(vertices);
    var wn = 0;
    var edgeChecked = false;

    for (var i = 0; i < edges.length; i++)
    {
      //console.log("EDGE " + i + ": " + edges[i][0].x + "," + edges[i][0].y + "/" + edges[i][1].x + "," + edges[i][1].y);
      if (edges[i][0].y >= point.y && edges[i][1].y < point.y)  //upward crossing, (an upward edge includes its starting endpoint, and excludes its final endpoint IN CARTESIAN COORDINATES)
      {
        var l = vector.isLeft(edges[i][0], edges[i][1], p);
        edgeChecked = true;
        //console.log("Upwards crossing: " + l);

        if (l === "right")
        {
          //console.log("Point is to the right of an upward crossing");
          wn++;
        }

        else if (l === "edge")
        {
          //point is on an edge
          //console.log("Edge collision");
          return true;
        }
      }

      else if (edges[i][0].y < point.y && edges[i][1].y >= point.y)  //downward crossing, (a downward edge excludes its starting endpoint, and includes its final endpoint)
      {
        var l = vector.isLeft(edges[i][0], edges[i][1], p);
        edgeChecked = true;
        //console.log("Downwards crossing: " + l);

        if (l === "right")
        {
          //console.log("Point is to the right of a downward crossing");
          wn--;
        }

        else if (l === "edge")
        {
          //point is on an edge
          //console.log("Edge collision");
          return true;
        }
      }
    }

    //console.log("Final wn: " + wn);

    if (edgeChecked === false)
    {
      //console.log("No edge qualified, false");
      return false;
    }

    if (wn === 0)
    {
      return true;
    }

    else return false;
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

  intersect: function(gon1, gon2, relVel)
  {
    var verts1 = gon1.translatedVerts();
    var verts2 = gon2.translatedVerts();
    var centroid1 = gon1.translatedCentroid();
    var centroid2 = gon2.translatedCentroid();
    var edges = module.exports.getEdgeVectors(verts1).concat(module.exports.getEdgeVectors(verts2));
    var perpAxis = vector.getOrthogonals(edges);
    var minIntervalDistance = Infinity;
    var translationAxis = {};
    var result = {intersect: true, willIntersect: true, mpv: null};

    //Loop through all the axis perpendicular to each edge
    for (var i = 0; i < perpAxis.length; i++)
    {
      //find the normal (unit) vector of the perpendicular axis
      var unitPerpAxis = vector.normal(perpAxis[i]);

      //find the projection of each polygon on said axis
      var proj1 = module.exports.projection(unitPerpAxis, verts1);
      var proj2 = module.exports.projection(unitPerpAxis, verts2);

      //check the interval distance of both projections
      var distance = vector.intervalDistance(proj1.min, proj1.max, proj2.min, proj2.max);

      //if the projections don't overlap, then there is no intersection between the polyons
      if (distance > 0)
      {
        result.intersect = false;
      }

      //Now to find if the polygons *will* intersect
      //Project the velocity on the current axis
      var velProj = vector.dotProduct(unitPerpAxis, relVel);

      //Get the projection of polygon 1 during this future movement
      if (velProj < 0)
      {
        proj1.min += velProj;
      }

      else proj1.max += velProj;

      //Do the same interval overlap test as above with the future prediction
      distance = vector.intervalDistance(proj1.min, proj1.max, proj2.min, proj2.max);

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
        translationAxis = unitPerpAxis;

        var direction = point.fromCoords(centroid1.x - centroid2.x, centroid1.y - centroid2.y);

        if (vector.dotProduct(direction, translationAxis) < 0)
        {
          translationAxis = point.fromCoords(-translationAxis.x, -translationAxis.y);
        }
      }
    }

    //The mpv (minimum push vector) can be used to push the polygons apart
    if (result.willIntersect === true)
    {
      result.mpv = point.fromCoords(translationAxis.x * minIntervalDistance, translationAxis.y * minIntervalDistance);
    }

    return result;
  },

  concaveIntersect: function(gon1, gon2, simple = true)
  {
    var dist = vector.distance(selfGon.translatedCentroid(), otherGon.translatedCentroid());
  	var selfVerts = selfGon.translatedVerts();
  	var otherVerts = otherGon.translatedVerts();
  	var selfVertsInside = [];
  	var otherVertsInside = [];

    if (dist > selfGon.distanceToFarthestVertex + otherGon.distanceToFarthestVertex)
    {
      return false;
    }

  	for (var i = 0; i < selfVerts.length; i++)
  	{
  		if (module.exports.isPointInPolygon(selfVerts[i], otherVerts) === true)
  		{
  			//console.log("Point (" + selfVerts[i].x + "," + selfVerts[i].y + " is in other polygon.");
        if (simple === true)
        {
          return true;
        }

  			selfVertsInside.push(selfVerts.length[i]);
  		}
  	}

  	for (var j = 0; j < otherVerts.length; j++)
  	{
  		if (module.exports.isPointInPolygon(otherVerts[j], selfVerts) === true)
  		{
  			//console.log("Point (" + otherVerts[j].x + "," + otherVerts[j].y + " is in self polygon.");
        if (simple === true)
        {
          return true;
        }

  			otherVertsInside.push(otherVerts.length[j]);
  		}
  	}

    if (simple === true)
    {
      return false;
    }

  	else return {selfVerts: selfVertsInside, otherVerts: otherVertsInside};
  },

/*  triangulate: function(polygon)
  {
    var verts = polygon.vertices;
    var triangles = [];
    var vertexArray = [];
    var inflections = [verts[0]];

  	console.log("Vertices to consider:");
  	console.log(verts);

    for (var i = 1; i < verts.length; i++)
    {
      console.log("Iteration " + i + " through vertex " + verts[i].x + "," + verts[i].y + ". Pushed it into vertexArray.");
      vertexArray.push(verts[i]);

      if (vertexArray.length < 2)
      {
        console.log("vertexArray has less than two vertices, continuing.");
        continue;
      }

      var tempArray = vertexArray.slice(0);
      var wasTriangleAdded = false;

      for (var j = 0; j < inflections.length; j++)
      {
        console.log("Iterating through inflection point " + j + ": " + inflections[j].x + "," + inflections[j].y);
  			var firstInnerSlope = vector.slope(point.fromCoords(tempArray[0].x - inflections[j].x, tempArray[0].y - inflections[j].y));
        var secondInnerSlope = vector.slope(point.fromCoords(tempArray[1].x - inflections[j].x tempArray[1].y - inflections[j].y));
        console.log("firstInnerSlope value is " + firstInnerSlope.value + " and its direction is " + firstInnerSlope.direction);
        console.log("secondInnerSlope value is " + secondInnerSlope.value + " and its direction is " + secondInnerSlope.direction);

        if (canTriangulate(firstInnerSlope, secondInnerSlope, polygon.clockwise) === false)
        {
          console.log("Triangulation not possible, a dent was found, continuing.");
          continue;
        }

        //Slope is good enough that the inner edge of the triangle won't intersect an edge of the polygon,
        //So push this as a valid triangle, then remove the first of the two vertices and replace it with the
        //current point of origin, to check if there's another possible inner edge with the origin of the
        //next iteration
        triangles.push([inflections[j], tempArray[0], tempArray[1]]);
        console.log("Triangulation possible, pushing triangle:");
        console.log([inflections[j], tempArray[0], tempArray[1]]);
        console.log("\n\n");
        tempArray.splice(0, 1, inflections[j]);
        wasTriangleAdded = true;

        if (inflections.length > 1 && inflections[j - 1] != null)
        {
          console.log("Inflection number " + (j - 1) + " (" + inflections[j - 1].x + "," + inflections[j - 1].y + ") satisfied and removed.");
          inflections.splice(j-1, 1); //remove previous point of origin, as the new valid one takes over
          j--;  //compensate for the loop index
        }
      }

      if (i >= verts.length - 1)
      {
        //Meaningless to do the last step if this is the last iteration
        break;
      }

      //no triangle could be added with the previous inflections, thus this is a concave dent
      //we must add vertexArray[0] vertex as a new origin for future triangles and remove it
      //from vertexArray
      if (wasTriangleAdded === true)
      {
        console.log("At least one triangle was added, so discard the first stored vertex " + vertexArray[0].x + "," + vertexArray[0].y);
        vertexArray.splice(0, 1);
      }

      //If triangles were added, discard the first of the stored vertices and move on
      else
      {
        console.log("No triangle was added after iterating through inflections.");
        inflections.unshift(vertexArray.shift());
      }
    }

    if (triangles.length < verts.length - 2)
    {
      console.log("Finished iterating through vertices, adding a last triangle (" + verts[0].x + "," + verts[0].y + ") (" + vertexArray[0].x + "," + vertexArray[0].y + ") (" + verts[verts.length - 1].x + "," + verts[verts.length - 1].y + ") with the closure of the polygon.");
  		triangles.push([point.fromCoords(verts[0].x, verts[0].y), vertexArray[0], point.fromCoords(verts[verts.length - 1].x, verts[verts.length - 1].y)]);
    }

    console.log("Algorithm finished, output is:\n\n\n\n");
    console.log(triangles);

    polygon.triangles = triangles;
    return triangles;
  },
*/
  triangulate: function(polygon)
  {
    var verts = polygon.vertices;
    var triangles = [];
    var edges = module.exports.getEdges(verts);
    var dents = module.exports.getDents(edges, polygon.clockwise);
    var innerEdges = [];

    console.log("Vertices to consider:");
    console.log(verts);
    console.log("\n\n\n\n")

    if (!dents.length || dents.length <= 0)
    {
      //Concave
      return module.exports.triangulateConcave(polygon);
    }

    for (var i = 0; i < dents.length; i++)
    {
      for (var j = 0; j < verts.length; j++)
      {
        var innerEdgeVector;
        var intersects = false;

        if (triangles.length == verts.length - 2)
        {
          break;
        }

        if (dents[i].x === verts[j].x && dents[i].y === verts[j].y)
        {
          //same vertex
          continue;
        }

        if (j > 0 && dents[i].x === verts[j - 1].x && dents[i].y === verts[j - 1].y)
        {
          //adjacent
          continue;
        }

        if (j < verts.length - 1 && dents[i].x === verts[j + 1].x && dents[i].y === verts[j + 1].y)
        {
          //adjacent
          continue;
        }

        if (i === 0 && dents[i].x === verts[verts.length - 1].x && dents[i].y === verts[verts.length - 1].y)
        {
          //adjacent on the loop of the array
          continue;
        }

        if (i === dents.length - 1 && dents[i].x === verts[0].x && dents[i].y === verts[0].y)
        {
          //adjacent on the loop of the array
          continue;
        }

        var intersectsEdge = false;
        var intersectsInnerEdge = false;
        innerEdgeVector = vector.create(dents[i], verts[j]);

        for (var z = 0; z < edges.length; z++)
        {
          var edgeVector = vector.create(edges[z][0], edges[z][1]);
          var sharedPoint = vector.sharedPoint(innerEdgeVector, edgeVector);

          if (sharedPoint != null && innerEdgeVector.slope.value != edgeVector.slope.value)
          {
            //It's an adjacent edge, so no point in checking
            continue;
          }

          if (vector.intersection(innerEdgeVector, edgeVector) != null)
          {
            console.log("Intersection with edge.");
            intersectsEdge = true;
            break;
          }
        }

        for (var z = 0; z < innerEdges.length; z++)
        {
          var otherInnerEdgeVector = vector.create(innerEdges[z][0], innerEdges[z][1]);
          var sharedPoint = vector.sharedPoint(innerEdgeVector, otherInnerEdgeVector);

          if (sharedPoint != null && innerEdgeVector.slope.value != otherInnerEdgeVector.slope.value)
          {
            //It's an adjacent edge, so no point in checking
            continue;
          }

          else if (sharedPoint != null && innerEdgeVector.slope.value == otherInnerEdgeVector.slope.value)
          {
            console.log("Repeated inner edge.");
            intersectsInnerEdge = true;
            break;
          }

          if (vector.intersection(innerEdgeVector, otherInnerEdgeVector) != null)
          {
            console.log("Intersection with other inner edge.");
            intersectsInnerEdge = true;
            break;
          }
        }

        if (intersectsEdge === true || intersectsInnerEdge === true)
        {
          continue;
        }

        if (dents.includes((verts[j-1] || verts[verts.length - 1])) === true)
        {
          //the middle point of the triangle we're checking is a dent, so we can't trace an inner edge or
          //it will be left outside
          console.log("the middle point of the triangle we're checking is a dent");
          continue;
        }

        console.log("Pushing triangle");
        innerEdges.push([innerEdgeVector.p1, innerEdgeVector.p2]);
        triangles.push([dents[i], verts[j], verts[j-1] || verts[verts.length - 1]]);

        if (triangles.length == verts.length - 2)
        {
          console.log("Algorithm finished early because all triangles have been traced.");
          return triangles;
        }

        else if (triangles.length === verts.length - 3)
        {
          if (verts[j+2] != null && verts[j+2].x === dents[i].x && verts[j+2].y === dents[i].y)
          {
            console.log("Pushed additional triangle since j+2 is the dent:");
            console.log(dents[i]);
            console.log(verts[j]);
            console.log(verts[j+1]);
            triangles.push([dents[i], verts[j], verts[j+1]]);
          }

          else if (verts[0].x === dents[i].x && verts[0].y === dents[i].y)
          {
            console.log("Pushed additional triangle since index 0 is the dent:");
            console.log(dents[i]);
            console.log(verts[j]);
            console.log(verts[verts.length - 1]);
            triangles.push([dents[i], verts[j], verts[verts.length - 1]]);
          }

          else if (verts[1].x === dents[i].x && verts[1].y === dents[i].y)
          {
            console.log("Pushed additional triangle since index 1 is the dent:");
            console.log(dents[i]);
            console.log(verts[j]);
            console.log(verts[0]);
            triangles.push([dents[i], verts[j], verts[0]]);
          }
        }
      }
    }

    return triangles;
  },

  triangulateConcave: function(polygon)
  {
    var triangles = [];
    var triangleVerts = [];
    var verts = polygon.vertices;

    for (var i = 1; i < verts.length; i++)
    {
      triangleVerts.push(verts[i]);

      if (triangleVerts.length < 2)
      {
        continue;
      }

      triangles.push([verts[0], triangleVerts[0], triangleVerts[1]]);
      triangleVerts.splice(0, 1);
    }

    return triangles;
  },

  getDents: function(edges, isClockwise)
  {
    var dents = [];

    for (var i = 0; i < edges.length; i++)
    {
      var index = i + 1;

      if (i === edges.length - 1)
      {
        index = 0;
      }

      var l = vector.isLeft(edges[index][0], edges[index][1], edges[i][0]);

      if (isClockwise === true && l < 0)
      {
        dents.push(edges[i][1]);
      }

      else if (isClockwise === false && l > 0)
      {
        dents.push(edges[i][1]);
      }
    }

    return dents;
  },

  getEdges: function(verts)
  {
    var edges = [];

    for (var i = 0; i < verts.length; i++)
    {
      edges.push([verts[i], verts[i+1] || verts[0]]);
    }

    return edges;
  },

  getEdgeVectors: function(verts)
  {
    var vectors = [];

    for (var i = 0; i < verts.length; i++)
    {
      var next = (i == verts.length - 1) ? 0 : i+1;
      vectors.push(point.fromCoords(verts[next].x - verts[i].x, verts[next].y - verts[i].y));
    }

    return vectors;
  },

  projection: function(oVector, verts)
  {
    var min = vector.dotProduct(verts[0], oVector);
    var max = min;

    for (var i = 1; i < verts.length; i++)
    {
      var proj = vector.dotProduct(verts[i], oVector);

      if (proj < min)
      {
        min = proj;
      }

      else if (proj > max)
      {
        max = proj;
      }
    }

    return {min: min, max: max};
  },

  regularGon: function(vertNbr, edgeLength, pos, clockwise = true)
  {
    var vertices = [point.zero(), point.fromCoords(edgeLength, edgeLength)];
  	var outerAngle = 360 / vertNbr;
  	var innerAngle = 180 - outerAngle;

    for (var i = 2; i < vertNbr; i++)
    {
      if (clockwise === true)
      {
        vertices.push(vector.rotate(vertices[i - 1], vertices[i - 2], -innerAngle));
      }

      else vertices.push(vector.rotate(vertices[i - 1], vertices[i - 2], innerAngle));
    }

    return module.exports.create(vertices, pos);
  },

  perturbedGon: function(vertNbr, edgeLength, minPert, maxPert, pos, clockwise = true)
  {
    var vertices = [point.zero(), point.fromCoords(edgeLength, edgeLength)];
  	var outerAngle = 360 / vertNbr;
  	var innerAngle = 180 - outerAngle;

    if (Math.abs(maxPert) > edgeLength / 2)
    {
      //maxPert = Math.floor(edgeLength / 2);
    }

    if (Math.abs(minPert) > edgeLength / 2)
    {
      //minPert = Math.floor(edgeLength / 2);
    }

    for (var i = 2; i < vertNbr; i++)
    {
      if (clockwise === true)
      {
        vertices.push(vector.rotate(vertices[i - 1], vertices[i - 2], -innerAngle));
      }

      else vertices.push(vector.rotate(vertices[i - 1], vertices[i - 2], innerAngle));
    }

    for (var i = 0; i < vertNbr; i++)
    {
      vertices[i].x += randomRange(minPert, maxPert);
      vertices[i].y += randomRange(minPert, maxPert);
    }

    return module.exports.create(vertices, pos);
  },

  isPointInTriangle: function(p, triangle)
  {
    var v0 = verts[0];
    var v1 = point.fromCoords(triangle[1].x - triangle[0].x, triangle[1].y - triangle[0].y);
    var v2 = point.fromCoords(triangle[2].x - triangle[0].x, triangle[2].y - triangle[0].y);

    var a = (vector.determinant(p, v2) - vector.determinant(v0, v2)) / vector.determinant(v1, v2);
    var b = - ((vector.determinant(p, v1) - vector.determinant(v0, v1)) / vector.determinant(v1, v2));

    if (a > 0 && b > 0 && a + b < 1)
    {
      return true;
    }

    else return false;
  }
}

module.exports.create.prototype.translatedVerts = function()
{
  var verts = [];

  for (var i = 0; i < this.vertices.length; i++)
  {
    verts.push(point.fromCoords(this.vertices[i].x + this.position.x, this.vertices[i].y + this.position.y));
  }

  return verts;
};

module.exports.create.prototype.translatedCentroid = function()
{
  return point.fromCoords(this.centroid.x + this.position.x, this.centroid.y + this.position.y);
};

function randomRange(min, max)
{
  return Math.floor(Math.random() * (max - min)) + min;
}

function canTriangulate(slope1, slope2, isClockwise)
{
  var firstAngle = vector.degrees(slope1);
	var secondAngle = vector.degrees(slope2);

	if (slope1.direction === "northeast" &&
			(slope2.direction === "east" || slope2.direction === "southeast"))
	{
		secondAngle += 360;
	}

	else if (slope2.direction === "northeast" &&
					(slope1.direction === "east" || slope1.direction === "southeast"))
	{
		firstAngle += 360;
	}

  console.log("First angle: " + firstAngle + ". Second Angle: " + secondAngle + ". Clockwise is " + isClockwise);

  if (isClockwise === true && secondAngle - firstAngle > 0)
	{
		return true;
	}

	else if (isClockwise === false && secondAngle - firstAngle < 0)
	{
		return true;
	}

	else return false;
}
