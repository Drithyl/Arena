
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
