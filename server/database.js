
var db;
var mongo = require("mongodb");

module.exports =
{
  connect: function(cb)
  {
    mongo.MongoClient.connect("mongodb://localhost:27017", function(err, client)
    {
    	if (err)
    	{
    		throw err.name + ": in mongo.MongoClient.connect(): " + err.message;
    	}

      db = client.db("arena");
      cb(null, module.exports);
    });
  },

  //items are inserted and saved by stringifying them and putting the string result into
  //an object with one key, json (the database cannot store strings alone), thus why
  //the result returned calls the property .json
  find: function(collection, query, cb)
  {
    db.collection(collection).find(query).toArray(function(err, res)
  	{
  		if (err)
  		{
        cb(err.name + ": from collection " + collection + ", could not grab item: " + err.message, null);
        return;
  		}

      cb(null, res);
  	});
  },

  //items are inserted and saved by stringifying them and putting the string result into
  //an object with one key, json (the database cannot store strings alone), thus why
  //the result returned calls the property .json
  findOne: function(collection, query, cb)
  {
    db.collection(collection).findOne(query, function(err, res)
  	{
  		if (err)
  		{
        cb(err.name + ": from collection " + collection + ", could not grab item: " + err.message, null);
        return;
  		}

      cb(null, res);
  	});
  },

  insert: function(collection, item, cb)
  {
    if (item == null)
    {
      cb("Error : in database.insert(): the provided data is null.", null);
      return;
    }

    if (Array.isArray(item) === true)
    {
      if (item.includes(null) === true)
      {
        cb("Error : in database.insert(): one of the items in the provided array is null.", null);
        return;
      }

      db.collection(collection).insertMany(item, function(err, res)
      {
        if (err)
        {
          cb(err.name + ": from collection " + collection + ", could not grab: " + err.message, null);
          return;
        }

        cb(null, res);
      });
    }

    else
    {
      db.collection(collection).insertOne(item, function(err, res)
      {
        if (err)
        {
          cb(err.name + ": from collection " + collection + ", could not grab: " + err.message, null);
          return;
        }

        cb(null, res);
      });
    }
  },

  save: function(collection, item, cb)
  {
    if (item == null)
    {
      cb("Error : in database.save(): the provided data is null.", null);
      return;
    }

    if (Array.isArray(item) === true)
    {
      if (item.includes(null) === true)
      {
        cb("Error : in database.save(): one of the items in the provided array is null.", null);
        return;
      }

      item.forEach(function(doc, index)
    	{
    		db.collection(collection).save(doc, {}, function(err, res)
    		{
    			if (err)
    			{
            cb(err.name + ": from collection " + collection + ", could not grab item: " + err.message, null);
            return;
    			}

    			if (index == csvData.length - 1)
    			{
    				cb(null, res);
    			}
    		});
    	});
    }

    else
    {
      db.collection(collection).save(item, {}, function(err, res)
      {
        if (err)
        {
          cb(err.name + ": from collection " + collection + ", could not grab item: " + err.message, null);
          return;
        }

        cb(null, res);
      });
    }
  },

  dropCSV: function(collection, cb = null)
	{
		db.listCollections({name: collection}).toArray(function(err, arr)
		{
      if (err)
      {
        cb(err.name + ": could not list collection: " + collection + ". " + err.message, null);
        return;
      }

			if (arr.length > 0)
			{
				db.collection(collection).drop(function(err, delOK)
				{
			    if (err)
					{
            cb(err.name + ": when attempting to drop collection: " + collection + ". " + err.message, null);
            return;
					}

			    if (delOK === false)
					{
            cb("delNotOK: could not drop collection: " + collection + ". ", null);
            return;
					}

          cb(null, true);
			  });
			}

			else cb(null, true);
		});
	},

  addUser: function(data, cb)
  {
    if (data.username == null || typeof data.username !== "string")
    {
      throw new Error("The username must be a string.");
    }

    if (data.password == null || typeof data.password !== "string")
    {
      throw new Error("The password must be a string.");
    }

  	db.collection("accounts").insertOne({username:data.username, password:data.password}, function(err)
  	{
  		if (err)
  		{
        cb(err.name + ": from collection accounts, could not add user: " + err.message, false);
        return;
  		}

  		cb(null, true);
  	});
  }
}
