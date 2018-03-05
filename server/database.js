
var db;

module.exports =
{
  init: function(database)
  {
    db = database;
    return this;
  },

  find: function(collection, query, cb)
  {
    db.collection(collection).find(query).toArray(function(err, res)
  	{
  		if (err)
  		{
        cb(err.name + ": from collection " + collection + ", could not grab:\n\n" + query + "\n\n: " + err.message, null);
        return;
  		}

      cb(null, res);
  	});
  },

  findOne: function(collection, query, cb)
  {
    db.collection(collection).findOne(query, function(err, res)
  	{
  		if (err)
  		{
        cb(err.name + ": from collection " + collection + ", could not grab:\n\n" + query + "\n\n: " + err.message, null);
        return;
  		}

      cb(null, res);
  	});
  },

  insert: function(collection, item, cb)
  {
    if (Array.isArray(item) === true)
    {
      db.collection(collection).insertMany(item, function(err, res)
      {
        if (err)
        {
          cb(err.name + ": from collection " + collection + ", could not grab:\n\n" + item + "\n\n: " + err.message, null);
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
          cb(err.name + ": from collection " + collection + ", could not grab:\n\n" + item + "\n\n: " + err.message, null);
          return;
        }

        cb(null, res);
      });
    }
  },

  save: function(collection, item, cb)
  {
    if (Array.isArray(item) === true)
    {
      item.forEach(function(doc, index)
    	{
    		db.collection(collection).save(doc, {}, function(err, res)
    		{
    			if (err)
    			{
            cb(err.name + ": from collection " + collection + ", could not grab:\n\n" + JSON.stringify(doc) + "\n\n: " + err.message, null);
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
          cb(err.name + ": from collection " + collection + ", could not grab:\n\n" + JSON.stringify(item) + "\n\n: " + err.message, null);
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

  isValidPassword: function(data, cb)
  {
  	db.collection("accounts").findOne({username:data.username, password:data.password}, function(err, res)
  	{
      if (err)
      {
        cb(err.name + ": from collection accounts, could not grab:\n\n" + JSON.stringify(data.username) + "\n\n: " + err.message, null);
        return;
      }

  		if (res != null)
  		{
  			cb(null, true);
  		}

  		else cb(null, false);
  	});
  },

  isUsernameTaken: function(data, cb)
  {
  	db.collection("accounts").findOne({username:data.username}, function(err, res)
  	{
      if (err)
      {
        cb(err.name + ": from collection accounts, could not grab:\n\n" + JSON.stringify(data) + "\n\n: " + err.message, null);
        return;
      }

  		if (res == null)
  		{
        cb(null, false);
  		}

  		else cb(null, true);
  	});
  },

  getCharacters: function(username, cb)
  {
    this.find("characters", {player: username}, function(err, result)
    {
      if (err)
      {
        cb(err.name + ": in getCharacters(): " + err.message, null);
        return;
      }

      cb(null, result);
    });
  },

  isCharacterNameTaken: function(name, cb)
  {
    this.findOne("characterNames", {"name": name}, function(err, res)
    {
      if (err)
      {
        cb(err.name + ": in isCharacterNameTaken(): " + err.message, null);
        return;
      }

      if (res == null)
  		{
  			cb(null, false);
  		}

  		else cb(null, true);
    });
  },

  addUser: function(data, cb)
  {
  	db.collection("accounts").insertOne({username:data.username, password:data.password}, function(err)
  	{
  		if (err)
  		{
        cb(err.name + ": from collection accounts, could not add user: " + JSON.stringify(data.username) + "\n\n: " + err.message, false);
        return;
  		}

  		cb(null, true);
  	});
  }
}
