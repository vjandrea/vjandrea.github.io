defineNamespace(window, "timers");
(function (ns) {
    var refreshTimer;
    var requestTimer;
    var blinkTimer;
    var consoleClearTimer;

    var refreshTimerHandlers = [];
    var requestTimerHandlers = [];
    var blinkTimerHandlers = [];

    var GlobalTimers = function () { };

    GlobalTimers.Init = function () {
        refreshTimer = setInterval(function () {
            for (var i = 0; i < refreshTimerHandlers.length; i++) {
                refreshTimerHandlers[i]();
            }
        }, 33);

        requestTimer = setInterval(function () {
            for (var i = 0; i < requestTimerHandlers.length; i++) {
                requestTimerHandlers[i]();
            }
        }, 33);

        blinkTimer = setInterval(function () {
            for (var i = 0; i < blinkTimerHandlers.length; i++) {
                blinkTimerHandlers[i]();
            }
        }, 300);

        consoleClearTimer = setInterval(function () {
            if(console && console.clear && window.applicationType == "debug")
            {
                console.clear();
            }
        }, 360000);
    };

    GlobalTimers.AddRefreshTimerEventHandler = function (handler) {
        refreshTimerHandlers.push(handler);
    };

    GlobalTimers.RemoveRefreshTimerEventHandler = function (handler) {
        var index = refreshTimerHandlers.indexOf(handler);
        if (0 <= index && index < refreshTimerHandlers.length) {
            refreshTimerHandlers.splice(index, 1);
        }
    };

    GlobalTimers.AddRequestTimerEventHandler = function (handler) {
        requestTimerHandlers.push(handler);
    };

    GlobalTimers.RemoveRequestTimerEventHandler = function (handler) {
        var index = requestTimerHandlers.indexOf(handler);
        if (0 <= index && index < requestTimerHandlers.length) {
            requestTimerHandlers.splice(index, 1);
        }
    };

    GlobalTimers.AddBlinkTimerEventHandler = function (handler) {
        blinkTimerHandlers.push(handler);
    };

    GlobalTimers.RemoveBlinkTimerEventHandler = function (handler) {
        var index = blinkTimerHandlers.indexOf(handler);
        if (0 <= index && index < blinkTimerHandlers.length) {
            blinkTimerHandlers.splice(index, 1);
        }
    };

    GlobalTimers.Clear = function () {
        refreshTimerHandlers.length = 0;
        requestTimerHandlers.length = 0;
        blinkTimerHandlers.length = 0;
        window.clearTimeout(refreshTimer);
        window.clearTimeout(requestTimer);
        window.clearTimeout(blinkTimer);
        window.clearTimeout(consoleClearTimer);
    };

    ns.GlobalTimers = GlobalTimers;

}(window.timers));
