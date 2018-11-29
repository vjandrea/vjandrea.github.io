(function(ui, $){

    ui.forcedDisconnect=false;

    var serverIsNotAvailable = function() {
        Overlay.Show(window.Overlays.serverUnavailableOverlay);
    };

    var connectionEstablished = function() {
        $("#connectButton .content").html("Connected... - Disconnect");
        $("#disconnectedPanel").hide(200);
    };

    var connectionLost = function() {
        $("#connectButton .content").html("Not connected... - Reconnect");
        $("#disconnectedPanel").show(200);
    };

    var sessionCreated = function() {
        Overlay.Close();
    };

    var sessionLost = function() {
        Overlay.Show(window.Overlays.serverDisabledOverlay);
    };

    var serverStateChanged = function() {
        if (Server.ValidSession()) {
            Overlay.Close();
        }
        else {
            Overlay.Show(window.Overlays.serverDisabledOverlay);
        }
    };

    var connectionLimitReached = function(value) {
        if (value) {
            Overlay.Show(window.Overlays.connectionsLimitOverlay);
        } else {
            Overlay.Close();
        }
    };


    var $document = window.generic.globs.$document;
    $document.bind(Server.notAvailableEvent, serverIsNotAvailable);
    $document.bind(Server.connectionEstablishedEvent, connectionEstablished);
    $document.bind(Server.connectionLostEvent, connectionLost);
    $document.bind(Server.connectionsLimitReachedEvent, connectionLimitReached);
    $document.bind(Server.sessionCreatedEvent, sessionCreated);
    $document.bind(Server.sessionLostEvent, sessionLost);

    $(window).unload(function(){
        $document.unbind(Server.notAvailableEvent, serverIsNotAvailable);
        $document.unbind(Server.connectionEstablishedEvent, connectionEstablished);
        $document.unbind(Server.connectionLostEvent, connectionLost);
        $document.unbind(Server.connectionsLimitReachedEvent, connectionLimitReached);
        $document.unbind(Server.sessionCreatedEvent, sessionCreated);
        $document.unbind(Server.sessionLostEvent, sessionLost);
    });

    var SessionDataHandler = {
        name: "SessionDataHandler",
        handler: (function() {
            var connectionsLimit = false;
            return function (response) {
                if (response.session !== undefined) {
                    var connectionsLimitReached = response.connections_limit_reached !== undefined;
                    if (connectionsLimitReached !== connectionsLimit) {
                        $document.trigger(Server.connectionsLimitReachedEvent, [connectionsLimitReached]);
                    }
                    connectionsLimit = connectionsLimitReached;

                    if(response.forceLogin !== undefined)
                    {
                        window.ui.loginForm.Show();
                    }

                    if (!connectionsLimitReached) {
                        var sessionId = response.session;
                        // if (sessionId > 0) {
                        //     window.generic.statusLogging("Got non zero session : "+sessionId);
                        // } else if (sessionId < 0) {
                        //     window.generic.statusLogging("Remote is disabled");
                        // }

                        Server.SetSessionId(sessionId);
                    }
                    return true;
                }
                return false;
            };
        })()
    };

    DataHandlerManager.Register(SessionDataHandler);
})(window.ui, jQuery);
