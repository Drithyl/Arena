const fs = require("fs");

module.exports =
{
	readFile: function(path)
	{
		var data;

		if (fs.existsSync(path) === false)
		{
			throw new Error("An error occurred when trying to read the file: " + path + ". It seems that this file does not exist.");
		}

		return fs.readFileSync(path, "utf8");
	},

	copyFile: function(source, target, callback)
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
		    callback(err, source);
		    cbCalled = true;
		  }
		}
	},

	copyFileSync: function(source, target)
	{
		var data = fs.readFileSync(source);

		if (data == null)
		{
			throw new Error("An error occurred when sync reading the file at " + source);
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
			if (fs.existsSync(compoundPath) === false)
		  {
		    fs.mkdirSync(compoundPath);
		  }

			compoundPath += "/" + splitPath.shift();
		}
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
	}
}
