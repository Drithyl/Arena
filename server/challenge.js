
var socketManager;
var playerList;
var battleModule;
var list = {};

const WIDTH = 120;
const HEIGHT = 120;

module.exports =
{
  init: function(sm, players, battle)
  {
    socketManager = socketManager;
    playerList = players;
    battleModule = battle;
    return this;
  },

  Challenge: function(challenger, target)
  {
    var _challenger = challenger;
    var _target = target;
    var _accepted = false;
    var _stamp = Date.now();

    if (_challenger == null)
    {
      throw new Error("The challenger does not appear in the online players' list.");
    }

    if (_target == null)
    {
      throw new Error("The targeted player does not appear in the online players' list.");
    }

    if (_challenger.isBattling === true)
    {
      throw new Error("You cannot challenge other players while in the middle of a battle.");
    }

    if (_target.isBattling === true)
    {
      throw new Error("The targeted player is in the middle of a battle.");
    }

    if (_challenger.challenges[_target.username] != null)
    {
      throw new Error("You already issued a challenge to this user.");
    }

    if (list[_challenger.username] == null)
    {
      list[_challenger.username] = {};
    }

    list[_challenger.username][_target.username] = this;
    _challenger.challenges[_target.username] = this;
  },

  listenToChallenges: function(socket)
  {
    var player = playerList.find(function(pl)
    {
      return pl.socket.id === socket.id;
    });

    socket.on("challengeRequest", function(data, clientCb)
    {
      challengeRequest(data, player, clientCb);
    });

    socket.on("challengeReply", function(data, clientCb)
    {
      challengeReply(data, player.username, clientCb);
    });
  }
}

function challengeRequest(data, challenger, clientCb)
{
  var target = playerList.find(function(pl)
  {
    return pl.username === data.target;
  });

  try
  {
    new module.exports.Challenge(challenger, target);
  }

  catch(err)
  {
    clientCb(err, null);
    return;
  }

  target.socket.emit("challengeRequest", {challenger: challenger.username});
  clientCb(null);
}

function challengeReply(data, username, clientCb)
{
  var challenge;

  var challenger = playerList.find(function(player)
  {
    return player.username === data.challenger;
  });

  var target = playerList.find(function(player)
  {
    return player.username === username;
  });

  //verifications
  if (challenger == null)
  {
    clientCb("The challenger could not be found.");
    return;
  }

  if (challenger.isBattling === true)
  {
    clientCb("The challenge can no longer be accepted because the challenger started another battle.");
    return;
  }

  if (target.isBattling === true)
  {
    clientCb("The challenge can no longer be accepted because you started another battle.");
    return;
  }

  if (list[challenger.username] == null || list[challenger.username][target.username] == null)
  {
    clientCb("The challenge offer could not be found.");
    return;
  }

  challenge = list[challenger.username][target.username];

  //create a new battle since it's accepted
  if (data.challengeAccepted === true)
  {
    new battleModule.Battle([challenger, target], new mapModule.RectangularMap(WIDTH, HEIGHT));
  }

  //delete challenge object whether it is accepted or rejected
  delete list[challenger.username][target.username];

  //send response to the original challenger, whether it was accepted or rejected
  challenger.socket.emit("challengeReply", {target: target.username, challengeAccepted: data.challengeAccepted});
}
