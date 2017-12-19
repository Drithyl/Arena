
(function(window, document, $)
{
  window.Login =
  {
    initialize: function()
    {
      var loginFormUsername = document.getElementById("login-form__username");
      var loginFormPassword = document.getElementById("login-form__password");

      document.getElementById("login-form__sign-in").onclick = function()
      {
        socket.emit("signIn", {username: loginFormUsername.value, password: loginFormPassword.value});
      }

      document.getElementById("login-form__sign-up").onclick = function()
      {
        socket.emit("signUp", {username: loginFormUsername.value, password: loginFormPassword.value});
      }

      socket.on("signUpResponse", function(data)
      {
        if (data.success === true)
        {
          alert("Sign up successful. You can now log in.");
        }

        else alert("Sign up unsuccessful. This username is already taken.");
      });

      //Received only by this client
      socket.on("signInRejected", function()
      {
        alert("Sign in unsuccessful.");
      });

      socket.on("signInAccepted", function(data)
      {
      });
    },


  }
})(window, document, jQuery);
