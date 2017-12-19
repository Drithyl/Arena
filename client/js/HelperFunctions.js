
(function(window, document, $)
{
  window.Helper =
  {
    initialize: function()
    {

    },

    createHTMLEle: function(ele, options = {}, parent = null)
    {
      var element = document.createElement(ele);

      for (var key in options)
      {
        element.setAttribute(key, options[key]);
      }

      if (parent != null)
      {
        parent.appendChild(element);
      }

      return element;
    },

    addTooltip: function(div, tipTxt)
    {
      div.setAttribute("class", "tooltip");
      var tooltip = Helper.createHTMLEle("span", {class: "tooltip__text"}, div);
      tooltip.innerText = tipTxt;
      return tooltip;
    },

    stringify: function(obj, postVal = "")
    {
      var str = "";
      var iterations = 0;

      (function loop(val)
      {
        iterations++;

        if (Array.isArray(val) === true)
        {
          for (var i = 0; i < val.length; i++)
          {
            if (iterations > 1)
            {
              str += "\n";
            }

            loop(val[i]);
          }
        }

        else if (typeof val == "object")
        {
          for (var key in val)
          {
            if (iterations > 1)
            {
              str += "\n";
            }

            str += key + ": ";
            loop(val[key]);
          }
        }

        else if (typeof val != "function" && val != null)
        {
          str += val + postVal;
        }

      })(obj);

      return str;
    }
  }
})(window, document, jQuery);
