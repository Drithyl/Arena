const fs = require("fs");
const event = require("../server/emitter.js");
var keyIndex;

module.exports =
{
	init: function(index)
	{
		keyIndex = index;
		return this;
	},

	readContent: function()
	{
		var files = fs.readdirSync("content", "utf8");
		var content = {};

		for (var i = 0; i < files.length; i++)
		{
			if (/\.csv$/.test(files[i]) === true)
			{
				var jsonName = files[i].replace(".csv", ".json");
				var jsonPath = "content/" + jsonName;
				var keyName = files[i].replace(".csv", "");
				var dataCheck;
				var data;

				if (fs.existsSync(jsonPath) === true)
				{
					content[keyName] = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
					module.exports.log("Loaded JSON content from " + jsonPath);
					continue;
				}

				module.exports.log("JSON data for " + files[i] + " does not exist. Verifying existing CSV data.");
				dataCheck = module.exports.verifyCSVData("content/" + files[i]);

				if (dataCheck.success === false)
				{
					module.exports.log("Verification of the CSV file failed: " + dataCheck.info);
					continue;
				}

				var data = module.exports.csvToObject("content/" + files[i]);
				fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
				module.exports.log("Created a JSON file for " + files[i]);
				content[keyName] = data;
				module.exports.log("Loaded CSV content from " + files[i]);
			}
		}

		return content;
	},

	importCSV: function(db, path, collectionName, cb = null)
	{
		var rawData = this.readFile(path);
		var csvData;

		if (rawData == null)
		{
			this.log("Failed to read raw CSV data from " + path);
			return;
		}

		csvData = this.parseCSV(rawData, CSVCellToVal);
		saveCSV(db, csvData, collectionName, cb);
	},

	dropAndImportCSV: function(db, path, collectionName, cb = null)
	{
		var rawData = this.readFile(path);
		var csvData;

		if (rawData == null)
		{
			this.log("Failed to read raw CSV data from " + path);
			return;
		}

		csvData = this.parseCSV(rawData, CSVCellToVal);

		this.dropCSV(db, collectionName, function()
		{
			saveCSV(db, csvData, collectionName, cb);
		});
	},

	dropCSV: function(db, collectionName, cb = null)
	{
		db.listCollections({name: collectionName}).toArray(function(err, arr)
		{
			if (arr.length > 0)
			{
				db.collection(collectionName).drop(function(err, delOK)
				{
			    if (err)
					{
						throw err;
					}

			    if (delOK)
					{
						module.exports.log("Collection " + collectionName + " deleted");

						if (cb != null)
						{
							cb();
						}
					}
			  });
			}

			else if (cb != null)
			{
				cb();
			}
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
				if (parseCellFn != null)
				{
					rowObj[headers[j]] = parseCellFn(values[j], headers[j]);
				}

				else rowObj[headers[j]] = values[j];
			}

			arr.push(rowObj);
  	}

		return arr;
  },

	csvToObject: function(path)
	{
		var rawData = this.readFile(path);
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
		var rawData = this.readFile(path);
		var csvData;
		var jsonPath = path.replace(".csv", ".json");

		if (rawData == null)
		{
			this.log("Failed to read raw CSV data from " + path);
			return;
		}

		csvData = this.parseCSV(rawData, CSVCellToVal);
		fs.writeFileSync(jsonPath, JSON.stringify(csvData, null, 2));
	},

	readFile: function(path)
	{
		var data;

		if (fs.existsSync(path) === false)
		{
			this.log("An error occurred when trying to read the file: " + path + ". It seems that this file does not exist.");
			return;
		}

		return fs.readFileSync(path, "utf8");
	},

	copyFile: function(source, target, cb)
	{
		var cbCalled = false;
		var rd;

	  this.checkAndCreateDir(target);
		rd = fs.createReadStream(source);

		rd.on("error", function(err)
		{
		  done(err);
		});

		var wr = fs.createWriteStream(target);
		wr.on("error", function(err)
		{
		  done(err);
		});

		wr.on("close", function(ex)
		{
		  done();
		});

		rd.pipe(wr);
		function done(err)
		{
		  if (!cbCalled)
			{
		    cb(err, source);
		    cbCalled = true;
		  }
		}
	},

	copyFileSync: function(source, target)
	{
		var data = fs.readFileSync(source);

		if (data == null)
		{
			rw.log("An error occurred when sync reading the file at " + source);
			return;
		}

	  this.checkAndCreateDir(target);
		fs.writeFileSync(target, data);
	},

	checkAndCreateDir: function(filepath)
	{
		var splitPath = filepath.split("/");
		var compoundPath = splitPath.shift();

		//It's length >= 1 because we don't want the last element of the path, which will be a file, not a directory
		while (splitPath.length && splitPath.length >= 1)
		{
			if (fs.existsSync(compoundPath) == false)
		  {
		    fs.mkdirSync(compoundPath);
		  }

			compoundPath += "/" + splitPath.shift();
		}
	},

	readJSON: function(savePath, callback, reviver = null)
	{
		var obj = {};

		fs.readFile(savePath, "utf8", (err, data) =>
	 	{
			if (err)
			{
				this.log("There was an error while trying to read the JSON file " + savePath + ":\n\n" + err);
				return null;
			}

			if (data == null)
			{
				this.log("Couldn't extract any data from " + savePath);
				return null;
			}

			if (/[\w\d]/.test(data) == false)
			{
				this.log("Data in " + savePath + " is empty.");
				return null;
			}

			if (reviver == null)
			{
				obj = JSON.parse(data);
			}

			else
			{
				obj = JSON.parse(data, reviver);
			}

			callback(obj);
		});
	},

	saveJSON: function(filePath, obj, keysToFilter)
  {
  	fs.writeFile(filePath, objToJSON(obj), (err) =>
  	{
  		if (err)
  		{
  			this.log("Save failed for the following char data: " + filePath + "\nThe error given is: " + err);
  			return;
  		}
  	});
  },

	capitalizeKeys: function(keysList, file, outputName)
	{
		var data = fs.readFileSync(file, "utf8");

		for (var i = 0; i < keysList.length; i++)
		{
			for (var key in keysList[i])
			{
				if (typeof keysList[i][key] == "object")
				{
					for (var subkey in keysList[i][key])
					{
						data = data.replace(new RegExp(keysList[i][key][subkey], "ig"), keysList[i][key][subkey]);
					}
				}

				else
				{
					data = data.replace(new RegExp(keysList[i][key], "ig"), keysList[i][key]);
				}
			}
		}

		fs.writeFileSync(outputName, data);
	},

	verifyCSVData: function(path)
	{
		var rawData = this.readFile(path);
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
	},

	log: function(input)
	{
		var d = new Date().toString().replace(" (W. Europe Standard Time)", "");
		d = d.replace(" (Central European Standard Time)", "");

		console.log (d + "\n-- " + input + "\n");

		fs.appendFile("bot.log.report", d + "\r\n-- " + input + "\r\n\n", function (err)
		{
			if (err)
			{
				console.log(err);
			}
		});
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

			if (isNaN(data[i][key]) === false || key == keyIndex.ID || key == keyIndex.NAME  || key == keyIndex.DESCR)
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
	if (keyIndex.arr.includes(key) === true)
	{
		return true;
	}

	else if (/^\w\d+$/.test(key) === true)	//an id
	{
		return true;
	}

	else if (keyIndex.arr.includes(key) === false && keyIndex.lowerCaseArr.includes(key.toLowerCase()) === false)
	{
		return "The key " + key + " does not exist.";
	}

	else if (keyIndex.lowerCaseArr.includes(key.toLowerCase()) === true)
	{
		return "The key " + key + " exists but has the wrong capitalization. The proper one is " + keyIndex.arr[keyIndex.lowerCaseArr.indexOf(key.toLowerCase())];
	}

	else
	{
		return "The key " + key + " resulted in an unexpected error.";
	}
}

function verifyValue(key, value)
{
	if (value === null && (key == keyIndex.CAT_LIST || key == keyIndex.TRANS_LIST || key == keyIndex.ON_HIT ||
			key == keyIndex.ON_DMG || key == keyIndex.SLOT_TYPE || key == keyIndex.DESCR || key == keyIndex.AB_LIST ||
			key == keyIndex.EFF_LIST || key == keyIndex.PATH_LIST || key == keyIndex.PROP_LIST || key == keyIndex.ATKS))
	{
		//These fields can be left empty, which will yield a null value, without causing issues
		return true;
	}

	else if (key == keyIndex.ID || key == keyIndex.NAME || key == keyIndex.SLOT_TYPE ||
		  key == keyIndex.DESCR || key == keyIndex.AFF_PART)
	{
		if (typeof value == "string")
		{
			return true;
		}

		else return "The value of key " + key + " is " + (typeof value) + ". Expected a string.";
	}

	else if (key == keyIndex.SHLD_PRT || key == keyIndex.DEF || key == keyIndex.PARRY ||
					 key == keyIndex.ENC || key == keyIndex.REQ_SLOTS || key == keyIndex.RAR ||
					 key == keyIndex.START_GOLD || key == keyIndex.START_POINTS ||
					 key == keyIndex.TRANS_POINTS || key == keyIndex.SIZE || key == keyIndex.MAX_HP ||
					 key == keyIndex.MR || key == keyIndex.MRL || key == keyIndex.STR ||
					 key == keyIndex.ATK || key == keyIndex.PRC || key == keyIndex.AP ||
				 	 key == keyIndex.DMG || key == keyIndex.LEN || key == keyIndex.NBR_ATKS)
	{
		if (isNaN(value) === false)
		{
			return true;
		}

		else return "The value of key " + key + " is " + (typeof value) + ". Expected a Number.";
	}

	else if (key == keyIndex.CAN_HEAL || key == keyIndex.CAN_RPL)
	{
		if (value === true || value === false)
		{
			return true;
		}

		else return "The value of key " + key + " is " + (typeof value) + ". Expected a boolean.";
	}

	else if (key == keyIndex.CAT_LIST || key == keyIndex.TRANS_LIST || key == keyIndex.DMG_TYPE_LIST ||
					 key == keyIndex.ON_HIT || key == keyIndex.PROP_LIST || key == keyIndex.ON_DMG)
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

	else if (key == keyIndex.ATKS || key == keyIndex.EFF_LIST || key == keyIndex.COST_LIST ||
					 key == keyIndex.PRT || key == keyIndex.AB_LIST || key == keyIndex.PATH_LIST ||
					 key == keyIndex.SLOT_LIST || key == keyIndex.PART_LIST)
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

function CSVCellToVal(cell, header)
{
	if (cell == null || /\S+/.test(cell) === false)
	{
		//empty
		return null;
	}

	cell = cell.replace(/"/g, "");

	if (header == keyIndex.CAT_LIST || header == keyIndex.TRANS_LIST || header == keyIndex.DMG_TYPE_LIST ||
			header == keyIndex.ON_HIT || header == keyIndex.PROP_LIST || header == keyIndex.ON_DMG)
	{
		return evalArray(cell.split(","));
	}

	else if (header == keyIndex.ATKS || header == keyIndex.EFF_LIST || header == keyIndex.COST_LIST ||
					 header == keyIndex.PRT || header == keyIndex.AB_LIST || header == keyIndex.PATH_LIST ||
					 header == keyIndex.SLOT_LIST || header == keyIndex.PART_LIST)
	{
		return evalObj(cell.split(","));
	}

	else return evalPrimitive(cell);
}

function saveCSV(db, csvData, collectionName, cb = null)
{
	csvData.forEach(function(doc, index)
	{
		db.collection(collectionName).save(doc, {}, function(err, res)
		{
			if (err)
			{
				module.exports.log("An error occurred when saving csv document. The doc was:\n\n" + JSON.stringify(doc) + "\n\n. The error is:\n\n" + err);
				return;
			}

			if (cb != null && index == csvData.length - 1)
			{
				cb();
			}
		});
	});
}

/*******************READING SAVED DATA**********************/
function objToJSON(obj, keysToFilter = {"instance": null, "guild": "id", "channel": "id", "role": "id", "organizer": "id"})
{
	var copyObj = Object.assign({}, obj);

	for (var key in keysToFilter)
	{
		if (copyObj[key] == null)
		{
			continue;
		}

		if (keysToFilter[key] == null)
		{
			delete copyObj[key];
			continue;
		}

		if (copyObj[key][keysToFilter[key]])
		{
			copyObj[key] = copyObj[key][keysToFilter[key]];
		}
	}

	return JSON.stringify(copyObj);
}
