defineNamespace(window, "generic.globs");

$(document).ready(function () {
    var GlobalTimers = window.timers.GlobalTimers;

    if (!fullSupport) {
        $("#body").hide();
        return;
    }

    try
    {
        window.applicationCache.addEventListener('updateready', function(e) {
            // Manifest has changed. Ask to reload the page.
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
              //if (confirm('A new version of this app is available. Load it?')) {
                window.location.reload(true);
              //}
            }
        }, false);
    }
    catch(e)
    {
        console.error(e);
    }


    GlobalTimers.Init();
    $.Layout.init();

    generic.globs.commandLine = new uiTypes.CommandLine(document.getElementsByClassName("header-left-top")[0]);
    generic.globs.commandLine.init();
    commands.Commands.oops = function() {
        return commands.Command(commands.CommandType.oops, function(command, eventType) {
            if (!generic.globs.commandLine.isEmpty()) {
                if (eventType === Touch.maTouchUp) {
                    Server.send({ command: generic.globs.commandLine.getText(), backspace: 1 });
                }
            } else {
                commands.defaultCommandHandler(command, eventType);
            }
        })
    };

    commands.Commands.ma = (function() {
        var maCommand = commands.StateCommand(commands.CommandType.ma, function(command, eventType) {
                commands.ui.defaultCommandExecute(command, eventType);
                commands.defaultCommandHandler(command, command.getState().value ? Touch.maTouchDown : Touch.maTouchUp);
            }
        );
        return function() {
            return maCommand;
        };
    })();

    generic.globs.serverCommandManager = new commands.ServerCommandManager();

    generic.globs.pageManager = new uiTypes.pages.PageManager(generic.globs.commandLine, window.Server, generic.globs.GlobalSettings);
    generic.globs.pageManager.Init();

    new uiTypes.Wheel("DIM", $(".dimmer-wheel")).init();

    $("body").bind('touchmove', function(e){
        e.preventDefault();
    });

    window.addEventListener("touchmove", function(event) {
        event.preventDefault();
    }, {passive: false} );
    window.addEventListener("touchend", function(event) {
        event.preventDefault();
        if(event.target != undefined)
        {
            if(event.target.nodeName == "INPUT")
            {
                event.target.focus();
            }
            else
            {
                event.target.click();
            }
        }
    }, {passive: false} );

    Server.connect();
});
$(window).unload(function () {
    if (generic.globs.pageManager) {
        generic.globs.pageManager.dispose();
    }
    if (generic.globs.commandLine) {
        generic.globs.commandLine.dispose();
    }
    Server.closeAllConnection();
});
