

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
      if ((x >= x1 && x <= x2) || ( x >= x2 && x <= x1))
      {
        if ((y >= y1 && y <= y2) || ( y >= y2 && x <= y1))
        {
          return true;
        }
      }

      return false;
    }
  }
}
