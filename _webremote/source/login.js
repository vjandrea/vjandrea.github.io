(function(){

   var loginForm = null;

   var LoginForm = function () {
       var fakePasswordMarker = "myUserIsSuperHero";
       var loginOverlay = $.getOrCreate("loginOverlay");
       var loginFormControl = 0;
       var usernameControlID = "loginUsername";
       var passwordControlID = "loginPassword";
       LoginManager.loginResultCallback = LogInEventHandler;

       this.Show = function () {
           //console.log("show");
           if (Server.IsConnected()) {
               Init.call(this);
           } else {
               $.alert({ message: "You need to be connected to the Console to login", title: "Login" });
           }
       };

       function Init() {
           var username = LoginManager.GetCachedUsername();
           var password = LoginManager.GetCachedPassword();

           if(isDot2())
           {
               username = "remote";
           }
           password = (password === md5("")) ? "" : fakePasswordMarker;

           if (!username) {
               username = "";
               password = "";
           }
           else if (!password) {
               password = "";
           }

           var data = 0;
           if (!loginFormControl) {
               if(isDot2())
               {
                   data = {
                       overlay: loginOverlay,
                       title: "Login",
                       modalWindow: true,
                       textboxes: [
                           {
                               id: passwordControlID,
                               text: "Password:",
                               type: "password",
                               value: password,
                               focused: true,
                               autoSelect: true
                           }
                       ],
                       buttons: [{
                           id: "loginSubmit",
                           type: "custom",
                           text: "Login"
                       }],
                       formSubmitHandler: function (event, data) {
                           //console.log("form submit handler");
                           event.preventDefault();
                           var username = "remote";
                           var password = getPassword(data[passwordControlID]);
                           LoginManager.SetUserData(username, password);
                           LoginManager.sendLoginRequest(username, password);
                           return false;
                       },
                       stylePrefix: "loginForm"
                   };
               }
               else
               {
                   data = {
                       overlay: loginOverlay,
                       title: "Login",
                       modalWindow: true,
                       textboxes: [
                           {
                               id: usernameControlID,
                               text: "Name:",
                               type: "text",
                               value: username,
                               focused: true,
                               autoSelect: true,
                               autoCapitalize: true
                           },
                           {
                               id: passwordControlID,
                               text: "Password:",
                               type: "password",
                               value: password
                           }
                       ],
                       buttons: [{
                           id: "loginSubmit",
                           type: "custom",
                           text: "Login"
                       }],
                       formSubmitHandler: function (event, data) {
                           event.preventDefault();
                           var username = data[usernameControlID];
                           var password = getPassword(data[passwordControlID]);

                           if (username.length > 0) {
                               LoginManager.SetUserData(username, password);
                               LoginManager.sendLoginRequest(username, password);
                           } else {
                               $.alert({ message: "You need to give a Username", title: "Login Error" });
                           }
                           return false;
                       },
                       stylePrefix: "loginForm"
                   };
               }
           } else {
               $("#" + usernameControlID, loginFormControl).val(username);
               $("#" + passwordControlID, loginFormControl).val(password);
               data = {
                   overlay: loginOverlay,
                   control: loginFormControl,
                   modalWindow: true
               };
           }

           generic.globs.config.keyboardCaptured = false;
           $.Popup.Show(data);
           loginFormControl = data.control;
       }

       function LogInEventHandler(success) {
           //console.log("login event handler");
           if (success) {
               $.Popup.CloseLast();
               generic.globs.config.keyboardCaptured = true;
               window.onkeydown = null;
           } else {
               if(isDot2())
               {
                   $.alert({ message: "Wrong Password!", title: "Login Error" });
               }
               else
               {
                   $.alert({ message: "Invalid user. Please, choose another user", title: "Login Error" });
               }
           }
       }

       function getPassword(password) {
           if ((password !== undefined) && (password !== null) && (password !== fakePasswordMarker)) {
               password = md5(password);
           } else {
               password = LoginManager.GetCachedPassword();
           }

           return password;
       };
   };

   var LoginManager = function () {
   };

   var username = "";
   var password = "";
   LoginManager.LogIn = (function () {
       //console.log("login");
       var autoconnect = false;
       var first = true;
       var autoconnectCounter = 0;
       var autoconnectMaxAttempts = 10;

       return function () {
           if (first) {
               first = false;
           } else {
               ++autoconnectCounter;
               autoconnect = autoconnectCounter <= autoconnectMaxAttempts;
               autoconnectCounter = autoconnect ? autoconnectCounter : 0;
           }

           if (autoconnect) {
               LoginManager.sendLoginRequest(username || LoginManager.GetCachedUsername(), username ? password : LoginManager.GetCachedPassword());
           } else {
               loginForm.Show();
           }
       };
   })();

   LoginManager.sendLoginRequest = function (username, password) {
       //console.log("send request");
       Server.send({
           requestType: Server.requestTypes.login,
           username: username,
           password: password
       });
   };

   LoginManager.loginResultCallback = utilities.emptyFunction;
   LoginManager.onResultHandler = function (success) {
       //window.generic.statusLogging("onResultHandler");
       LoginManager.status = success;
       if (success) {
           if(isDot2())
           {
               $.cookie('dot2password', LoginStoreFilter(username) ? password : "");
           }
           else
           {
               $.cookie('gma2login', username);
               $.cookie('gma2password', LoginStoreFilter(username) ? password : "");
           }
       }
       LoginManager.loginResultCallback(success);
   };
   function LoginStoreFilter(username) {
       return username.toLowerCase() !== "administrator";
   }

   LoginManager.LogOut = function () {
       //console.log("logout");
       LoginManager.status = false;
   };
   LoginManager.SetUserData = function (user, pass) {
       username = user;
       password = pass;
   };
   LoginManager.GetCachedUsername = function () {
       if(!isDot2())
       {
           return $.cookie('gma2login') || $.cookie('malogin') || "";
       }
   };
   LoginManager.GetCachedPassword = function () {
       if(isDot2())
       {
           return $.cookie('dot2password') || "";
       }
       else
       {
           return $.cookie('gma2password') || $.cookie('mapassword')  || "";
       }
   };

   var getLoginManager = function() {
       return LoginManager;
   };

   loginManager = LoginManager;
   loginForm = new LoginForm();

   window.generic.globs.$document.bind(Server.sessionCreatedEvent, LoginManager.LogIn);
   window.generic.globs.$document.bind(Server.sessionLostEvent, LoginManager.LogOut);

   window.login.GetLoginManager = getLoginManager;
   window.ui.loginForm = loginForm;
})();
