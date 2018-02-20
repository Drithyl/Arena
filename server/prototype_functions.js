
Object.defineProperty(Object.prototype, "toFlatArr",
{
  value: function()
  {
    var arr = [];

    (function loop(obj)
    {
      if (Array.isArray(obj) === true)
      {
        for (var i = 0; i < obj.length; i++)
        {
          loop(obj[i]);
        }
      }

      else if (typeof obj == "object")
      {
        for (var key in obj)
        {
          loop(obj[key]);
        }
      }

      else if (typeof obj != "function")
      {
        arr.push(obj);
      }

    })(this);

    return arr;
  }
});

/*
* Returns a cloned object without any function inside it.  Object prototype
* function, so there are no arguments, it is simply called on the object in
* question directly: objectToClone.functionless();
*
* WARNING:
*
*   Array properties with functions in them will either get cloned as an empty
*   array if every item in them is a function, or they will get cloned containing
*   only the items that are not functions, meaning that their index order will
*   be altered!
*/

Object.defineProperty(Object.prototype, "functionless",
{
  value: function()
  {
    var clone = Object.assign({}, this);

    (function loop(obj)
    {
      if (Array.isArray(obj) === true)
      {
      	var arrClone = [];

        for (var i = 0; i < obj.length; i++)
        {
        	var result = loop(obj[i]);
          if (result != null) arrClone.push(result);
        }

        return arrClone;
      }

      else if (typeof obj == "object")
      {
        for (var key in obj)
        {
          obj[key] = loop(obj[key]);
          if (obj[key] == null) delete obj[key];
        }

        return obj;
      }

      else if (typeof obj != "function")
      {
      	console.log("Returning '" + obj + "'!");
        return obj;
      }

      else return null;

    })(clone);

    return clone;
  }
});

Array.prototype.toLowerCase = function()
{
	var lowerCaseArr = [];

	for (var i = 0; i < this.length; i++)
	{
		if (typeof this[i] == "string")
		{
			lowerCaseArr.push(this[i].toLowerCase());
		}

		else lowerCaseArr.push(this[i]);
	}

	return lowerCaseArr;
};

String.prototype.toJSON = function(key)
{
	return "{" + key + ": " + this + "}";
};

Number.prototype.isFloat = function(n)
{
	return Number(n) === n && n % 1 !== 0;
};

Number.prototype.toRadians = function(decimals = 2)
{
	return ((this * Math.PI) / 180).round(decimals);
};

Number.prototype.toDegrees = function(decimals = 2)
{
	return ((this * 180) / Math.PI).round(decimals);
};

Number.prototype.cap = function(limit)
{
	if (this > limit)
	{
		return limit;
	}

	else return this * 1;
};

Number.prototype.lowerCap = function(limit)
{
	if (this < limit)
	{
		return limit;
	}

	else return this * 1;
};

Number.prototype.absCap = function(limit)
{
	if (this > limit)
	{
		return limit;
	}

	else if (this < -limit)
	{
		return -limit;
	}

	else return this * 1;
};

Number.prototype.wrap = function(limit)
{
	if (this > limit)
	{
		return 0;
	}

	else return this * 1;
};

Number.prototype.round = function(decimals)
{
	var power = Math.pow(10, decimals);

	if (this.toString().includes(".") === false || decimals <= 0)
	{
		return Math.floor(this);
	}

	else return Math.round(power * this) / power;
};

//a modulus function is required because the default % operator does not deal properly with negatives
Number.prototype.mod = function(mod)
{
  return ((this % mod) + mod) % mod;
};
