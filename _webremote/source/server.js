var GlobalTimers = window.timers.GlobalTimers;
window.g_ErrPop = false;

(function (ns) {
    var Session = function(sessionTimerHandler){
        this.m_timer = null;
        this.m_requestSent = false;
        this.m_sessionTimerEventHandler = sessionTimerHandler;
        this.m_isLoggedIn = false;
        this.m_id = 0;
    };

    Session.prototype.start = function () {
        window.generic.statusLogging("Start Session");
        if (!this.m_timer) {
            // set timer to 50ms to obtain session id as soon as possible
            this.m_timer = setTimeout(this.m_sessionTimerEventHandler, 50);
            this.m_requestSent = true;
        }
        this.m_sessionTimerEventHandler();
    };

    Session.prototype.stop = function () {
        if (this.m_timer) {
            window.clearTimeout(this.m_timer);
            this.m_timer = false;
        }
        this.m_id = 0;
        window.generic.statusLogging("Stop Session");
    };

    Session.prototype.getId = function () {
        return this.m_id;
    };

    Session.prototype.setId = function (value) {
        this.m_id = value;

        if (this.m_timer) {
            if(this.m_requestSent) {
                window.clearTimeout(this.m_timer);
            } else {
                window.clearInterval(this.m_timer);
            }
            this.m_requestSent = false;
            // after receiving session id drop timer frequence to 10s for the purpose of "present"-flag sending
            this.m_timer = setInterval(this.m_sessionTimerEventHandler, 10000);
        }
    };

    Session.prototype.getIsLoggedIn = function() {
        return this.m_isLoggedIn;
    };

    Session.prototype.setIsLoggedIn = function(state) {
        this.m_isLoggedIn = state;
    };

    // export
    ns.Session = Session;
})(window);

window.Server = (function () {
    var Server = {};
    Server.requestTypes = {
        command: "command",
        keyname: "keyname",
        login: "login",
        encoder: "encoder",
        commandConfirmation: "commandConfirmation",
        commandConfirmationResult: "commandConfirmationResult",
        presetCommandConfirmation: "presetCommandConfirmation",
        presetCommandConfirmationResult: "presetCommandConfirmationResult",
        getdata: "getdata",
        presetTypes: "presetTypes",
        presetTypeList: "presetTypeList",
        fixtureSheet: "fixtureSheet",
        channelSheet: "channelSheet",
        fixtureLayout: "fixtureLayout",
        executorSheet: "executorSheet",
        commandHistory: "commandHistory",
        pool: "pool",
        pool_itemSelected: "pool_itemSelected",
        playbacks: "playbacks",
        playbacks_userInput: "playbacks_userInput",
        close: "close",
    };

    Server.requestOptions = {
        command:                            { maxRequests: 0 },
        keyname:                            { maxRequests: 0 },
        login:                              { maxRequests: 10 },
        encoder:                            { maxRequests: 0 },
        commandConfirmation:                { maxRequests: 10 },
        commandConfirmationResult:          { maxRequests: 0 },
        presetCommandConfirmation:          { maxRequests: 10 },
        presetCommandConfirmationResult:    { maxRequests: 0 },
        getdata:                            { maxRequests: 1 },
        presetTypes:                        { maxRequests: 1 },
        presetTypeList:                     { maxRequests: 1 },
        fixtureSheet:                       { maxRequests: 1 },
        channelSheet:                       { maxRequests: 1 },
        executorSheet:                      { maxRequests: 1 },
        commandHistory:                     { maxRequests: 1 },
        pool:                               { maxRequests: 3 },
        pool_itemSelected:                  { maxRequests: 0 },
        playbacks:                          { maxRequests: 1 },
        playbacks_userInput:                { maxRequests: 0 },
        close:                              { maxRequests: 0 },
    };

    var $document = window.generic.globs.$document;

    Server.notAvailableEvent = "serverNotAvailable";
    Server.connectionEstablishedEvent = "connectionEstablished";
    Server.connectionLostEvent = "connectionLost";

    Server.connectionsLimitReachedEvent = "connectionLimitReached";

    Server.sessionCreatedEvent = "sessionCreated";
    Server.sessionLostEvent = "sessionLost";

    var serverURI = 'ws://' + window.location.host + '/?ma=1';

    var socket = false;
    var m_serverAccessAttempts = 0;
    var m_maxServerAccessAttempts = 20;
    var connected = false;
    var reconnectTimer = false;

    var blockedRequests = {};
    var defaultMaxRequestsCount = 30;

    var session = new Session(sessionTimerEventHandler);

    function reconnectTimerCall() {
        window.generic.statusLogging("Trying to reconnect");
        Server.connect();

        window.clearTimeout(reconnectTimer);
        reconnectTimer = false;
    }

    function sessionTimerEventHandler() {
        Server.send({}, true);
    }

    Server.IsConnected = function () {
        return connected;
    }

    Server.ValidSession = function () {
        return session.getId() > 0;
    }
    Server.GetSessionId = function () {
        return session.getId();
    }
    Server.SetSessionId = function (value) {
        var serverStateChanged = (value != session.getId()) && (value <= 0 || session.getId() <= 0);
        session.setId(value);
        if (serverStateChanged) {
            if (value > 0) {
                $document.trigger(Server.sessionCreatedEvent, value);
            } else if(value < 0) {
                $document.trigger(Server.sessionLostEvent);
            }
        }
    };
    Server.SetLoginState = function (state) {
        return session.setIsLoggedIn(state);
    }

    Server.connect = function () {
        ++m_serverAccessAttempts;
        if (m_serverAccessAttempts > m_maxServerAccessAttempts) {
            $document.trigger(Server.notAvailableEvent);
        }
        window.generic.statusLogging("m_serverAccessAttempts = " + m_serverAccessAttempts);
        window.generic.statusLogging("Connecting to : " + serverURI);
        try {
            socket = new WebSocket(serverURI);
            socket.onopen = Server.SocketOnOpen;
            socket.onmessage = Server.SocketOnMessage;
            socket.onclose = Server.SocketOnClose;
            socket.onerror = Server.SocketOnError;
        }
        catch (exception) {
            Server.SocketOnException();
        }
    };

    Server.disconnect = function () {
        if (connected && (socket.readyState == 1)) {
            Server.send({ requestType: Server.requestTypes.close });
            session.stop();
            socket.close();
        }/* else {
            throw new Error();
            Server.connect();
        }*/
    };

    Server.SocketOnOpen = function (msg) {
        window.generic.statusLogging("Connected to Console");
        session.start();
        connected = true;

        if (reconnectTimer) {
            window.clearTimeout(reconnectTimer);
            reconnectTimer = false;
        }
    }

    Server.resetBlockedRequests = function()
    {
        blockedRequests = {};
    }

    Server.SocketOnMessage = function (msg) {
        var data = "";
        try {
            data = JSON.parse(msg.data);
        } catch (err) {
            blockedRequests = {};
            window.generic.statusLogging("Invalid Data received from Console (" + err + ") - Message [" + msg.data + "]");
            return;
        }

        if (data.status == "server ready") {
            $document.trigger(Server.connectionEstablishedEvent);
            m_serverAccessAttempts = 0;
            window.generic.statusLogging("Console is ready");
            var oldAppType = localStorage.getItem("appType");
            localStorage.setItem("appType",data.appType);
            if(oldAppType != data.appType)
            {
                location.reload();
            }
            var title = document.getElementsByTagName("title")[0];
            if(title)
            {
                title.innerText = data.appType;
            }
            generic.globs.pageManager.applyPageFilter();
        } else {
            var responseType = data.responseType;
            if(responseType && responseType == "login")
            {
                session.setIsLoggedIn(data.result);
            }
            if (responseType) {
                blockedRequests[responseType] = (blockedRequests[responseType] || 1) - 1;
            } else {
                if(data.session == undefined)
                {
                    window.generic.statusLogging("Incomming typeless response");
                }
            }

            try {
                DataHandlerManager.HandleResponse(data);
            } catch (err) {
                window.generic.statusLogging("Error at response handling. Response type '" + responseType + "'");
            }
        }
    }

    var handleDisconnect = function(){
        var connectionStateChanged = connected;
        connected = false;
        if (connectionStateChanged) {
            $document.trigger(Server.connectionLostEvent);
        }
        socket = false;

        if (!window.ui.forcedDisconnect) {
            if (!reconnectTimer) {
                reconnectTimer = setTimeout(function () { reconnectTimerCall(); }, 1000);
            }
        }
    };

    Server.SocketOnClose = function (msg) {
        handleDisconnect();
        window.generic.statusLogging("Disconnected from the Console");
    };

    Server.SocketOnError = Server.SocketOnException = function (msg) {
        handleDisconnect();
        window.generic.statusLogging("General Connection error");
    };

    Server.send = function (payload, __ignoreSession) {
        if ((socket.readyState == 1) && Server.IsConnected()) {
            if (__ignoreSession || (session.getId() > 0)) {
                payload.session = session.getId();
                if (payload.command) {
                    payload.requestType = Server.requestTypes.command;
                    window.generic.statusLogging("exec command: " + payload.command);
                }

                if (payload.keyname) {
                    payload.requestType = Server.requestTypes.keyname;
                    window.generic.statusLogging("set keyname: " + payload.keyname + ", value: " + payload.value);
                }

                if (payload.cmdlineText) {
                    window.generic.statusLogging("set text: " + payload.cmdlineText);
                }

                var requestType = payload.requestType;
                if(requestType != undefined && requestType != "login" && requestType != "getdata" && requestType != Server.requestTypes.close)
                {
                    if(!session.getIsLoggedIn())
                    {
                        var errorOverlay = $.getOrCreate("errorOverlay");
                        var data = {
                            overlay: errorOverlay,
                            title: "Error",
                            modalWindow: true,
                            messages: [{
                                text:"You are not logged in!"
                            }],
                            buttons: [{
                                type: "custom",
                                text: "Close"
                            }],
                            stylePrefix: "loginForm",
                            formSubmitHandler: function (event, data) {
                                setTimeout(function(){
                                    window.g_ErrPop = false;
                                },3000); //Giving the user three seconds to login properly
                                $.Popup.CloseLast();
                                return false;
                            }
                        }
                        var loginOverlay = $.getOrCreate("loginOverlay");
                        var loginVisible = loginOverlay.css("display");
                        if(!window.g_ErrPop && loginVisible == "none")
                        {
                            window.generic.statusLogging("Dropped request. User is not logged in.");
                            $.Popup.Show(data);
                            window.g_ErrPop = true;
                        }
                        return;
                    }
                }
                var requestOptions = Server.requestOptions[payload.requestType];
                var maxRequestsCount = requestOptions ? requestOptions.maxRequests : defaultMaxRequestsCount;
                payload = Object.assign(payload, requestOptions);

                blockedRequests[requestType] = blockedRequests[requestType] || 0;

                if (!maxRequestsCount || (blockedRequests[requestType] < maxRequestsCount)) {
                    var out = JSON.stringify(payload);
                    try {
                        socket.send(out);
                        if (requestType) {
                            blockedRequests[requestType] = (blockedRequests[requestType] || 0) + 1;
                        }
                    } catch (exception) {
                        window.generic.statusLogging("Error sending Data to the console (" + exception + ")");
                    }
                } else {
                    window.generic.statusLogging("Dropped request. Request type: " + requestType);
                }
            }
        }
    }

    Server.closeAllConnection = function () {
        GlobalTimers.Clear();
        window.generic.statusLogging("Closing all Connections as moving away from Page");
        Server.disconnect();
    }

    Server.sendAttributeEncoderResolution = function (attributeId, resolution) {
        Server.send({ command: 'assign attribute "' + attributeId + '"/EncoderResolution=' + resolution });
    }

    return Server;

} ());
