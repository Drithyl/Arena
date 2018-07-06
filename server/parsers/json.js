
const fileSystem = require("fs");

module.exports =
{
  readJSON: function(savePath, callback, reviver = null)
	{
		var obj = {};

		fileSystem.readFile(savePath, "utf8", (err, data) =>
	 	{
			if (err)
			{
        callback(new Error("There was an error while trying to read the JSON file " + savePath + ":\n\n" + err), null);
			}

			if (data == null)
			{
        callback(new Error("Couldn't extract any data from " + savePath), null);
			}

			if (/[\w\d]/.test(data) == false)
			{
        callback(new Error("Data in " + savePath + " is empty."), null);
			}

			if (reviver == null)
			{
				obj = JSON.parse(data);
			}

			else
			{
				obj = JSON.parse(data, reviver);
			}

			callback(null, obj);
		});
	},

	saveJSON: function(filePath, obj, keysToFilter, callback)
  {
  	fileSystem.writeFile(filePath, objToJSON(obj), (err) =>
  	{
  		if (err)
  		{
        callback(new Error("Save failed for the following char data: " + filePath + "\nThe error given is: " + err), null);
  		}

      callback(null);
  	});
  }
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
