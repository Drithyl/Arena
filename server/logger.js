
const fileSystem = require("fs");

module.exports =
{
  add: function(input)
	{
		var d = new Date().toString().replace(" (W. Europe Standard Time)", "");
		d = d.replace(" (Central European Standard Time)", "");

		console.log (d + "\n-- " + input + "\n");

		fileSystem.appendFile("appLog.txt", d + "\r\n-- " + input + "\r\n\n", function (err)
		{
			if (err)
			{
				console.log(err);
			}
		});
	},

  error: function(input)
  {
    module.exports.add(input);
    throw new Error(input);
  }
}
