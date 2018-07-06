
const fileSystem = require("fs");
const logger = require("./logger.js");

module.exports.strategies = loadStrategies("./server/strategies/");
module.exports.subStrategies = loadStrategies("./server/strategies/sub/");

function loadStrategies(directory)
{
  var obj = {};
  var files = fileSystem.readdirSync(directory);

  //Needed because require and fs work with different relative paths. fs uses
  //the node_modules root, while require uses this module's path as a starting point
  var relDir = directory.replace(/server\//i, "");

  for (var i = 0; i < files.length; i++)
  {
    if (files[i].includes(".js") === false)
    {
      continue;
    }

    var name = files[i].slice(0, files[i].lastIndexOf(".js"));
    obj[name] = require(relDir + files[i]);
  }

  if (Object.keys(obj).length < 1)
  {
    logger.add("The strategy directory " + directory + " is empty.");
  }

  return obj;
}
