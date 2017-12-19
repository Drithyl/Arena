
(function(window, document, $)
{
  window.Input =
  {
    mousePos: {x: 0, y: 0},
    mouseClicked: false,
    keysHeld: {},

    initialize: function()
    {
      //onkeypress is used ONLY to know exactly which character has been typed by the key,
      //not which KEY was pressed. This and onkeydown give different keyCode results, and
      //both events are constantly emitted each frame for as long as the key is kept pressed down
      document.onkeypress = function(event)
      {
        socket.emit("characterPressed", {keyCode: event.keyCode});
      }

      document.onkeydown = function(event)
      {
        if (event.keyCode === 32)
        {
          event.preventDefault();
        }

        if (window.Input.keysHeld[event.keyCode] != null)
        {
          socket.emit("keyHeld", {keyCode: event.keyCode, frames: window.Input.keysHeld[event.keyCode]});
          window.Input.keysHeld[event.keyCode]++;
        }

        else
        {
          socket.emit("keyDown", {keyCode: event.keyCode});
          window.Input.keysHeld[event.keyCode] = 1;
        }
      }

      document.onkeyup = function(event)
      {
        socket.emit("keyUp", {keyCode: event.keyCode});
        delete window.Input.keysHeld[event.keyCode];
      }

      document.onmousedown = function(event)
      {
        if (event.which === 2)
        {
          event.preventDefault();
          socket.emit("middleMouseClick");
          socket.emit("middleMouseDown");
        }

        else if (event.which === 3)
        {
          event.preventDefault();
          socket.emit("rightMouseClick");
          socket.emit("rightMouseDown");
        }

        else
        {
          socket.emit("leftMouseClick");
          socket.emit("leftMouseDown");
        }
      }

      document.onmouseUp = function(event)
      {
        if (event.which === 2)
        {
          event.preventDefault();
          socket.emit("middlemouseUp");
        }

        else if (event.which === 3)
        {
          event.preventDefault();
          socket.emit("rightmouseUp");
        }

        else socket.emit("leftmouseUp");
      }

      document.onmousemove = function(event)
      {
        var xDiff = event.clientX - window.Input.mousePos.x;
        var yDiff = event.clientY - window.Input.mousePos.y;
        window.Input.mousePos.x = event.clientX;
        window.Input.mousePos.y = event.clientY;

        if (xDiff < 0 && Math.abs(xDiff) >= Math.abs(yDiff))
        {
          socket.emit("mouseMoveLeft", {position: {x: event.clientX, y: event.clientY}, distance: Math.abs(xDiff)});
        }

        else if (xDiff > 0 && Math.abs(xDiff) >= Math.abs(yDiff))
        {
          socket.emit("mouseMoveRight", {position: {x: event.clientX, y: event.clientY}, distance: Math.abs(xDiff)});
        }

        else if (yDiff < 0 && Math.abs(yDiff) > Math.abs(xDiff))
        {
          socket.emit("mouseMoveUp", {position: {x: event.clientX, y: event.clientY}, distance: Math.abs(yDiff)});
        }

        else if (yDiff > 0 && Math.abs(yDiff) > Math.abs(xDiff))
        {
          socket.emit("mouseMoveDown", {position: {x: event.clientX, y: event.clientY}, distance: Math.abs(yDiff)});
        }
      }
    },

  }
})(window, document, jQuery);
