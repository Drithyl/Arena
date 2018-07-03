

module.exports.BattleAction = function(actor, targetPosition, weapons, type)
{
  var _actor = actor;
  var _targetPosition = targetPosition;
  var _weapons = weapons;
  var _type = type;
  var _sequences = [];

  Object.defineProperty(this, "targetPosition",
  {
    get: function()
    {
      return _targetPosition;
    },
    enumerable: true
  });

  Object.defineProperty(this, "weapons",
  {
    get: function()
    {
      return _weapons;
    },
    enumerable: true
  });

  Object.defineProperty(this, "type",
  {
    get: function()
    {
      return _type;
    },
    enumerable: true
  });

  this.getSequences = function()
  {
    var results = [];

    _sequences.forEach(function(sequence)
    {
      results.push(sequence.getResult());
    });

    return results;
  }

  this.getLastSequence = function()
  {
    return _sequences[_sequences.length-1].getResult();
  }

  this.createSequence = function(target, weapon)
  {
    var sequence = new Sequence(target, weapon);
    _sequences.push(sequence);
    return sequence;
  };
}

function Sequence(target, weapon, type)
{
  var _target = target;
  var _weapon = weapon;
  var _type = type;
  var _resolution = new Map();

  Object.defineProperty(this, "target",
  {
    get: function()
    {
      return _target;
    },
    enumerable: true
  });

  Object.defineProperty(this, "weapon",
  {
    get: function()
    {
      return _weapon;
    },
    enumerable: true
  });

  Object.defineProperty(this, "type",
  {
    get: function()
    {
      return _type;
    },
    enumerable: true
  });

  this.addResult = function(key, result)
  {
    if (key === "target" || key === "weapon" || key === "type")
    {
      throw new Error("This is a reserved key.");
    }

    _sequence.set(key, result);

    Object.defineProperty(this, key,
    {
      get: function()
      {
        return _sequence.get(key);
      },
      enumerable: true
    });
  };

  this.removeResult = function(key)
  {
    if (_sequence.has(key) === true)
    {
      _sequence.delete(key);
      delete this[key];
    }
  };

  this.getResult = function()
  {
    return {target: this.target, weapon: this.weapon, results: _resolution}
  };
}
