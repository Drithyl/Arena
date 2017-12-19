
(function(window, document, $)
{
  window.Game =
  {
    screens: {},

    initialize: function()
    {
      //Received only by this client
      socket.on("startGame", function()
      {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("char-creation-screen").style.display = "none";
        document.getElementById("game-screen").style.display = "flex"; //visible
        Game.screens["battle-display"] = document.getElementById("battle-display");
        Game.screens["equipment-display"] = document.getElementById("equipment-display");
        Game.screens["character-display"] = document.getElementById("character-display");
        Game.screens["jobs-display"] = document.getElementById("jobs-display");
        Game.screens["shop-display"] = document.getElementById("shop-display");
        Game.screens["encyclopaedia-display"] = document.getElementById("encyclopaedia-display");
      });

      //received by all clients every time a new client initializes
      socket.on("init", function(data)
      {

      });

      socket.on("remove", function(id)
      {
        console.log("Player " + id + " removed.");
        delete Game.Player.list(id);
      });
    },

    changeScreen(id)
    {
      for (var key in Game.screens)
      {
        if (key === id)
        {
          continue;
        }

        Game.screens[key].style.display = "none";
      }

      if (Game.screens[id] != null)
      {
        Game.screens[id].style.display = "flex";
      }
    },

    update: function(data)
    {

    }
  }
})(window, document, jQuery);
