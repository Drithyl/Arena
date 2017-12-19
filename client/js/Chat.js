
(function(window, document, $)
{
  window.Chat =
  {
    initialize: function()
    {
      var chatInput = document.getElementById("chat-input");

      socket.on("addToChat", function(data)
      {
        document.getElementById("chat-text").innerHTML += "<div><b>" + data.name + ":</b> " + data.message + "</div>";
      });

      socket.on("evalAnswer", function(data)
      {
        console.log(data);
      });

      document.getElementById("chat-form").onsubmit = function(event)
      {
        event.preventDefault();

        if (chatInput.value[0] === "$")
        {
          socket.emit("evalServer", chatInput.value.slice(1));
        }

        else socket.emit("sendMsgToServer", chatInput.value);
        chatInput.value = "";
      };
    },

  }
})(window, document, jQuery);
