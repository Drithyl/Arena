
(function(window, document, $)
{
  window.Requests =
  {
    send: function(filename, cb)
    {
      var xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function()
      {
        if (this.readyState == 4 && this.status == 200)
        {
          cb(xhttp.responseText);
        }

        else console.log("Pending request changed readyState: " + this.readyState + " and status: " + this.status);
      };

      xhttp.open("GET", filename, true);
      xhttp.send();
    }

  }

})(window, document, jQuery);
