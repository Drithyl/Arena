
const fileSystem = require("fs");

module.exports =
{
  init: function(keys)
  {
    index = keys;
    return this;
  },

  importCSV: function(path, collectionName, cb = null)
	{
		var rawData = fileSystem.readFileSync(path, "utf8");
		var csvData;

		if (rawData == null)
		{
			this.log("Failed to read raw CSV data from " + path);
			return;
		}

		csvData = module.exports.parseCSV(rawData, CSVCellToVal);
		saveCSV(csvData, collectionName, cb);
	},

	dropAndImportCSV: function(path, collection, cb = null)
	{
		var rawData = fileSystem.readFileSync(path, "utf8");
		var csvData;

		if (rawData == null)
		{
			cb(new Error("Failed to read raw CSV data from " + path), null);
			return;
		}

		csvData = module.exports.parseCSV(rawData, CSVCellToVal);

		db.dropCSV(collection, function(err, res)
		{
			if (err)
			{
				cb(err.name + ": in dropAndImportCSV(): " + err.message, null);
				return;
			}

			db.save(collection, csvData, cb);
		});
	},

  parseCSV: function(rawData, parseCellFn = null, fieldEnd = ",")
  {
		var arr = [];

		//If the table only has whitespace or no item identifiers (< and >) it will be skipped
		if (/[\w\d<>]/.test(rawData) == false)
		{
			return arr;
		}

		//need to make sure there's at least a space in empty cells so that RegExp picks it up
		rawData = rawData.replace(/\,\,/g, ", ,").replace(/\,\,/g, ", ,");

  	var rows = rawData.split("\r\n");
		var headers = rows[0].split(fieldEnd);

  	for (var i = 1; i < rows.length; i++)
  	{
			var rowObj = {};

			if (/[\w\d]/.test(rows[i]) == false)
			{
				continue;
			}

			var values = rows[i].match(/(\s)|([^\"\,]+)|(\"([^\"\,]\,?)*\")/g);

			for (var j = 0; j < headers.length; j++)
			{
				if (parseCellFn == null)
				{
					rowObj[headers[j]] = CSVCellToVal(values[j], headers[j]);
				}

				else rowObj[headers[j]] = parseCellFn(values[j], headers[j]);
			}

			arr.push(rowObj);
  	}

		return arr;
  },

	csvToObject: function(path)
	{
		var rawData = fileSystem.readFileSync(path, "utf8");
		var csvData;
		var jsonPath = path.replace(".csv", ".json");

		if (rawData == null)
		{
			this.log("Failed to read raw CSV data from " + path);
			return null;
		}

		return this.parseCSV(rawData, CSVCellToVal);
	},

	csvToJSON: function(path)
	{
		var rawData = fileSystem.readFileSync(path, "utf8");
		var csvData;
		var jsonPath = path.replace(".csv", ".json");

		if (rawData == null)
		{
			this.log("Failed to read raw CSV data from " + path);
			return;
		}

		csvData = this.parseCSV(rawData, CSVCellToVal);
		fileSystem.writeFileSync(jsonPath, JSON.stringify(csvData, null, 2));
	},

  verifyCSVData: function(path)
	{
		var rawData = fileSystem.readFileSync(path, "utf8");
		var res;

		if (rawData == null)
		{
			return "Failed to read raw CSV data from " + path + " to verify its keys.";
		}

		res = findMismatches(this.parseCSV(rawData, CSVCellToVal));

		if (res.length <= 0)
		{
			return {success: true, info: "No key or value mismatch found in " + path + "."};
		}

		else
		{
			return {success: false, info: res};
		}
	}
}

function findMismatches(data)
{
	var chkArr = [];

	for (var i = 0; i < data.length; i++)
	{
		for (var key in data[i])
		{
			var keyChk = verifyKey(key);
			var valChk = verifyValue(key, data[i][key]);

			if (keyChk !== true)
			{
				chkArr.push("Data Index " + i + ": " + keyChk);
			}

			else if (valChk !== true)
			{
				chkArr.push("Data Index " + i + ": " + valChk);
			}

			if (isNaN(data[i][key]) === false || key == "id" || key == "name"  || key == "description")
			{
				continue;
			}

			if (typeof data[i][key] == "string")
			{
				var chk = verifyKey(data[i][key]);

				if (chk !== true)
				{
					chkArr.push("Data Index " + i + ": " + chk);
				}
			}

			else if (Array.isArray(data[i][key]) === true)
			{
				for (var j = 0; j < data[i][key].length; j++)
				{
					var chk = verifyKey(data[i][key][j]);

					if (chk !== true)
					{
						chkArr.push("Data Index " + i + ", sub index " + j + ": " + chk);
					}
				}
			}

			else if (typeof data[i][key] == "object")
			{
				for (var subKey in data[i][key])
				{
					var chk = verifyKey(subKey);

					if (chk !== true)
					{
						chkArr.push("Data Index " + i + ", subKey " + subKey + ": " + chk);
					}
				}
			}
		}
	}

	return chkArr;
}

function verifyKey(key)
{
	if (index.includes(key) === true)
	{
		return true;
	}

	else if (/^\w\d+$/.test(key) === true)	//an id
	{
		return true;
	}

	else if (index.includes(key) === false)
	{
		return "The key " + key + " does not exist.";
	}

	else
	{
		return "The key " + key + " resulted in an unexpected error.";
	}
}

function verifyValue(key, value)
{
	if (value === null && (key == "categories" || key == "transitions" || key == "onHit" ||
			key == "onDamage" || key == "slotType" || key == "description" || key == "abilities" ||
			key == "effects" || key == "paths" || key == "properties" || key == "naturalWeapons"))
	{
		//These fields can be left empty, which will yield a null value, without causing issues
		return true;
	}

	else if (key == "id" || key == "name" || key == "slotType" ||
		  key == "description" || key == "affectedPart")
	{
		if (typeof value == "string")
		{
			return true;
		}

		else return "The value of key " + key + " is " + (typeof value) + ". Expected a string.";
	}

	else if (key == "shieldProtection" || key == "defence" || key == "parry" ||
					 key == "encumbrance" || key == "requiredSlots" || key == "rarity" ||
					 key == "startGold" || key == "startPoints" ||
					 key == "transitionPoints" || key == "size" || key == "maxHP" ||
					 key == "mr" || key == "morale" || key == "strength" ||
					 key == "attack" || key == "precision" || key == "ap" ||
				 	 key == "damage" || key == "reach")
	{
		if (isNaN(value) === false)
		{
			return true;
		}

		else return "The value of key " + key + " is " + (typeof value) + ". Expected a Number.";
	}

	else if (key == "isHealable" || key == "canRepel")
	{
		if (value === true || value === false)
		{
			return true;
		}

		else return "The value of key " + key + " is " + (typeof value) + ". Expected a boolean.";
	}

	else if (key == "categories" || key == "transitions" || key == "damageTypes" ||
					 key == "onHit" || key == "properties" || key == "onDamage")
	{
		if (Array.isArray(value) === true)
		{
			for (var i = 0; i < value.length; i++)
			{
				if (typeof value[i] !== "string")
				{
					return "The value of index " + i + " in key " + key + " is " + (typeof value[i]) + ". Expected a string.";
				}
			}

			return true;
		}

		else return "The value of key " + key + " is " + (typeof value) + ". Expected an Array.";
	}

	else if (key == "naturalWeapons" || key == "effects" || key == "cost" ||
					 key == "protection" || key == "abilities" || key == "paths" ||
					 key == "slots" || key == "parts")
	{
		if (typeof value == "object" && Array.isArray(value) === false)
		{
			for (var subKey in value)
			{
				if (typeof value[subKey] !== "string" && isNaN(value[subKey]) === true)
				{
					return "The value of subKey " + subKey + " in key " + key + " is " + (typeof value[subKey]) + ". Expected a string or Number.";
				}
			}

			return true;
		}

		else return "The value of key " + key + " is " + (typeof value) + " or array. Expected an Object.";
	}

	else return "The value of key " + key + " did not match any expectation. Missing conditional?";
}

function CSVCellToVal(cell, header)
{
	if (cell == null || /\S+/.test(cell) === false)
	{
		//empty
		return null;
	}

	cell = cell.replace(/"/g, "");

	if (header == "categories" || header == "transitions" || header == "damageTypes" ||
			header == "onHit" || header == "properties" || header == "onDamage")
	{
		return evalArray(cell.split(","));
	}

	else if (header == "effects" || header == "cost" ||
					 header == "protection" || header == "abilities" || header == "paths" ||
					 header == "slots" || header == "parts")
	{
		return evalObj(cell.split(","));
	}

	else return evalPrimitive(cell);
}

function evalPrimitive(val)
{
	if (val.toLowerCase() == "none" || val.length <= 0)
	{
		return null;
	}

	else if (val.toLowerCase() == "true" || val.toLowerCase() == "yes")
	{
		return true;
	}

	else if (val.toLowerCase() == "false" || val.toLowerCase() == "no")
	{
		return false;
	}

	else if (isNaN(+val) === false)
	{
		return +val;
	}

	else return val;
}

function evalArray(contents)
{
	var arr = [];

	for (i = 0; i < contents.length; i++)
	{
		arr.push(contents[i].trim());
	}

	return arr;
}

function evalObj(contents)
{
	var obj = {};

	for (i = 0; i < contents.length; i++)
	{
		var name = contents[i].replace(/\([\w\d\s\.\-]*\)/g, "").trim();
		var amnt = contents[i].replace(name, "").replace(/[\(\)]/g, "").trim();

		//categories that expect an object with or without numerical values for the keys
		if (amnt === "")
		{
			//empty string because it will be enough to check whether the key exists when using the property
			obj[name] = "";
		}

		else obj[name] = obj[name] + +amnt || +amnt;
	}

	return obj;
}

function readFile(path)
{
  var data;

  if (fs.existsSync(path) === false)
  {
    throw new Error("An error occurred when trying to read the file: " + path + ". It seems that this file does not exist.");
  }

  return fs.readFileSync(path, "utf8");
}
