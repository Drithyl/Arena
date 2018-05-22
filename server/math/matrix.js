
module.exports =
{
  create: function(array2D)
  {
    this.rows = array2D.length;
    this.columns = array2D[0].length;

    if (this.rows > 1)
    {
      for (var i = 1; i < this.rows; i++)
      {
        if (array2D[i].length !== this.columns)
        {
          return null;
        }
      }
    }

    this.content = array2D;
  },

  verticesToMatrix: function(vertices)
  {
    var vertArr = [[], []];

    for (var i = 0; i < vertices.length; i++)
    {
      vertArr[0].push(vertices[i].x);
      vertArr[1].push(vertices[i].y);
    }

    return new module.exports.create(vertArr);
  },

  matrixToVertices: function(vertMatrix)
  {
    var vertices = [];

    for (var i = 0; i < vertMatrix.content[0].length; i++)
    {
      vertices.push(point.fromCoords(vertMatrix.content[0][i], vertMatrix.content[1][i]));
    }

    return vertices;
  }
}

module.exports.create.prototype.add = function(otherMatrix)
{
  if (otherMatrix.rows != this.rows || otherMatrix.columns != this.columns)
  {
    return null;
  }

  var newMatrix = []

  for (var i = 0; i < this.rows; i++)
  {
    newMatrix[i] = [];

    for (var j = 0; j < this.columns; j++)
    {
      newMatrix[i][j] = this.content[i][j] + otherMatrix.content[i][j];
    }
  }

  return new Matrix(newMatrix);
}

module.exports.create.prototype.subtract = function(otherMatrix)
{
  if (otherMatrix.rows != this.rows || otherMatrix.columns != this.columns)
  {
    return null;
  }

  var newMatrix = []

  for (var i = 0; i < this.rows; i++)
  {
    newMatrix[i] = [];

    for (var j = 0; j < this.columns; j++)
    {
      newMatrix[i][j] = this.content[i][j] - otherMatrix.content[i][j];
    }
  }

  return new Matrix(newMatrix);
}

module.exports.create.prototype.multiply = function(other, decimals = 2)
{
  if (this.columns != other.rows)
  {
    return null;
  }

  var aNumRows = this.rows;
  var aNumCols = this.columns;
  var bNumRows = other.rows;
  var bNumCols = other.columns;
  var m = new Array(aNumRows);  // initialize array of rows

  for (var r = 0; r < aNumRows; ++r)
  {
    m[r] = new Array(bNumCols); // initialize the current row

    for (var c = 0; c < bNumCols; ++c)
    {
      m[r][c] = 0;             // initialize the current cell

      for (var i = 0; i < aNumCols; ++i)
      {
        m[r][c] += (this.content[r][i] * other.content[i][c]).round(decimals);
      }
    }
  }

  return new Matrix(m);
}
