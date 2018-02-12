
(function(window, document, $)
{
  window.CharCreation =
  {
    attrDiv: null,
    attrValDiv: null,
    raceSelect: null,
    creationForm: null,
    forms: null,
    valDivs: {},

    initialize: function(forms)
    {
      CharCreation.forms = forms;

      socket.on("createCharacters", function()
      {
        $(document).ready(function()
        {
          //(jQuery) display in a dropdown the race choices received from the server
          CharCreation.raceSelect = document.getElementById("char-creation__race");
          CharCreation.creationForm = document.getElementById("char-creation-form");
          CharCreation.attrDiv = document.getElementById("char-creation__attr-div");
          CharCreation.attrValDiv = document.getElementById("char-creation__attr-points");

          CharCreation.createAttributesHTML();

          for (var i = 0; i < CharCreation.forms.length; i++)
          {
            var option = document.createElement("option");
            option.text = CharCreation.forms[i][KeyIndex.NAME];
            option.id = CharCreation.forms[i][KeyIndex.NAME];
            CharCreation.raceSelect.add(option);

            if (i === 0)
            {
              document.getElementById("char-creation__attr-points").innerText = CharCreation.forms[i][KeyIndex.START_POINTS];

              for (var attrKey in KeyIndex.CHAR)
              {
                CharCreation.valDivs[KeyIndex.CHAR[attrKey]].span.innerText = Helper.stringify(CharCreation.forms[i][KeyIndex.CHAR[attrKey]]);
              }
            }
          }

          CharCreation.switchScreen();

          $("#char-creation__race").change(function()
          {
            //gets the raceSelected child through jQuery and accesses its attributes
            var race = CharCreation.forms.filter(function (race){ return race[KeyIndex.NAME] == $("#char-creation__race").children(":selected").attr("id"); })[0];
            document.getElementById("char-creation__attr-points").innerText = race[KeyIndex.START_POINTS];

            for (var attrKey in KeyIndex.CHAR)
            {
              CharCreation.valDivs[KeyIndex.CHAR[attrKey]].span.innerText = Helper.stringify(race[KeyIndex.CHAR[attrKey]]);
            }
          });
        });
      });

      socket.on("characterSuccess", function()
      {
        document.getElementById("char-creation-screen").style.display = "none";
        document.getElementById("game-screen").style.display = "inline-block";
        alert("Your character was successfully created!");
      });

      socket.on("characterFail", function(err)
      {
        alert(err);
      });
    },

    sendCharacter: function()
    {
      var name = document.getElementById("char-creation__name").value;
      var race = $("#char-creation__race").children(":selected").attr("id");
      var attrValues = {};

      for (var key in KeyIndex.CHAR)
      {
        attrValues[KeyIndex.CHAR[key]] = CharCreation.valDivs[KeyIndex.CHAR[key]].span.innerText;
      }

      socket.emit("sendCharacter", {name: name, race: race, attributes: attrValues});
    },

    createAttributesHTML: function()
    {
      for (var attrKey in KeyIndex.CHAR)
      {
        var div = Helper.createHTMLEle("div", {class: "container"}, CharCreation.attrDiv);
        var nameDiv = Helper.createHTMLEle("div", {class: "container --margin-right"}, div);
        nameDiv.innerHTML += '<span class="char-creation char-creation__attr-name">' + KeyIndex.CHAR[attrKey] + ': </span>';
        CharCreation.valDivs[KeyIndex.CHAR[attrKey]] = Helper.createHTMLEle("div", {class: "container --margin-right"}, div);
        CharCreation.valDivs[KeyIndex.CHAR[attrKey]].span = Helper.createHTMLEle("span", {id: KeyIndex.CHAR[attrKey], class: "char-creation char-creation__attr-val"}, CharCreation.valDivs[KeyIndex.CHAR[attrKey]]);
        //CharCreation.valDivs[KeyIndex.CHAR[attrKey]].tooltip = Helper.addTooltip(CharCreation.valDivs[KeyIndex.CHAR[attrKey]], "tiptest");

        if (KeyIndex.ATTR[attrKey] != null)
        {
          var btnDiv = Helper.createHTMLEle("div", {class: "container --margin-right"}, div);
          btnDiv.innerHTML += '<button id="+' + KeyIndex.ATTR[attrKey] + '" type="button" class="char-creation char-creation__attr-btn" onclick="CharCreation.addPoint(this);">+</button>';
          btnDiv.innerHTML += '<button id="-' + KeyIndex.ATTR[attrKey] + '" type="button" class="char-creation char-creation__attr-btn" onclick="CharCreation.subtractPoint(this);">-</button>';
        }
      }
    },

    switchScreen: function()
    {
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("char-creation-screen").style.display = "flex";
    },

    addPoint: function(btn)
    {
      var attribute = btn.id.replace("+", "");

      if (+document.getElementById("char-creation__attr-points").innerText <= 0)
      {
        return;
      }

      document.getElementById(attribute).innerText = +document.getElementById(attribute).innerText + 1;
      document.getElementById("char-creation__attr-points").innerText = +document.getElementById("char-creation__attr-points").innerText - 1;
    },

    subtractPoint: function(btn)
    {
      var attribute = btn.id.replace("-", "");
      var index = $("#char-creation__race").children(":selected").attr("id")[0];

      if (+document.getElementById("char-creation__attr-points").innerText >= CharCreation.forms[index][KeyIndex.START_POINTS])
      {
        return;
      }

      if (+document.getElementById(attribute).innerText <= CharCreation.forms[index][attribute])
      {
        return;
      }

      document.getElementById(attribute).innerText = +document.getElementById(attribute).innerText - 1;
      document.getElementById("char-creation__attr-points").innerText = +document.getElementById("char-creation__attr-points").innerText + 1;
    }
  }
})(window, document, jQuery);
