
(function(window, document, $)
{
  window.Players =
  {
    list: null, //array of objects: {username: "", charName: "", info: ""}
    div: null,

    initialize: function(players)
    {
      Players.list = players;

      $(document).ready(function()
      {
        Players.div = document.getElementById("battle-display__players-div");

        for (var i = 0; i < Players.list.length; i++)
        {
          Players.addToDisplay(Players.list[i]);
        }
      });
    },

    addToDisplay: function(player)
    {
      Players.div.innerHTML += "<div>" + player.charName + " (" + player.username + ")</div>";
    }
  }
})(window, document, jQuery);
