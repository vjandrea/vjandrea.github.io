(function (ns) {
    var DataHandlerManager = { };

    DataHandlerManager._handlers = {};

    //     dataHandler:
    //     {
    //         name:"",
    //         handler: function(){return false;},
    //         executeOnce: false
    //     }
    DataHandlerManager.Register = function (dataHandler) {
        if (!DataHandlerManager._handlers[dataHandler.name]) {
            DataHandlerManager._handlers[dataHandler.name] = dataHandler.handler;
            DataHandlerManager._handlers[dataHandler.name].executeOnce = dataHandler.executeOnce;
        }
    };

    DataHandlerManager.Unregister = function (dataHandlerName) {
        if (DataHandlerManager._handlers[dataHandlerName]) {
            delete DataHandlerManager._handlers[dataHandlerName];
        }
    };

    DataHandlerManager.HandleResponse = function (response) {
        for (var key in DataHandlerManager._handlers) {
            DataHandlerManager._handlers[key](response);
        }
    };

    ns.DataHandlerManager = DataHandlerManager;
}(window));

(function () {
    var CommandConfirmationDataHandler = (function () {
        var sendConfirmationResult = function sendConfirmationResult(buttonIndex,option) {
            if(option)
            {
                Server.send({
                    requestType: Server.requestTypes.commandConfirmationResult,
                    result: buttonIndex,
                    option: option
                });
            }
            else
            {
                Server.send({
                    requestType: Server.requestTypes.commandConfirmationResult,
                    result: buttonIndex
                });
            }
            setTimeout(function() {
                Server.resetBlockedRequests();
            }, 1000);
        };

        var dataSent = false;

        var onButtonClick = function onButtonClick(event) {
            var res = parseInt(event.target.name);
            var option = [];
            var i = 0;
            while(true)
            {
                var optionGroup = document.getElementById("optionsContainer"+i);
                if(optionGroup)
                {
                    for(var j = 0; j < optionGroup.childNodes.length; j++)
                    {
                        if(optionGroup.childNodes[j].className.search("active") != -1)
                        {
                            var index = parseInt(optionGroup.childNodes[j].getAttribute("name"));
                            option.push(index);
                            break;
                        }
                    }
                }
                else
                {
                    break;
                }
                i++;
            }
            sendConfirmationResult(res,option);
            dataSent = true;
        };

        var onClose = function onClose() {
            if (!dataSent) {
                sendConfirmationResult(-1);
            }
        };

        return {
            name: "CommandConfirmationDataHandler",
            handler: function (response) {
                if (response.responseType != Server.requestTypes.commandConfirmation) {
                    return false;
                }

                dataSent = false;

                var buttons = [];

                for (var i = 0; i < response.buttons.length; i++) {
                    buttons.push({
                        id: "alert_button" + i,
                        text: response.buttons[i].text,
                        btnId: response.buttons[i].id,
                        type: "custom",
                        click: onButtonClick
                    });
                }
                if (response.focusedButtonIndex && (0 <= response.focusedButtonIndex) && (response.focusedButtonIndex < buttons.length)) {
                    buttons[response.focusedButtonIndex].focused = true;
                }

                $.alert({
                    title: response.tt,
                    message: response.msg,
                    buttons: buttons,
                    options: response.optionGroups,
                    onClose: onClose
                });
                return true;
            }
        };
    })();

    var PresetCommandConfirmationDataHandler = (function () {
        var sendConfirmationResult = function sendConfirmationResult(buttonIndex, presetStoreMode) {
            Server.send({
                requestType: Server.requestTypes.presetCommandConfirmationResult,
                presetStoreMode: presetStoreMode,
                result: buttonIndex
            });
        };

        var dataSent = false;

        var onButtonClick = function onButtonClick(event) {
            var res = event.target.id.split("alert_button");
            var buttonIndex = res[res.length - 1];
            sendConfirmationResult(buttonIndex, presetStoreMode);
            dataSent = true;
        };

        var onClose = function onClose() {
            if (!dataSent) {
                sendConfirmationResult(-1, -1);
            }
        };

        var presetStoreMode = 0;
        var onItemChanged = function (value) {
            var res = value.split("dropDownItem");
            presetStoreMode = res[res.length - 1];
        };

        return {
            name: "PresetCommandConfirmationDataHandler",
            handler: function (response) {
                if (response.responseType != Server.requestTypes.presetCommandConfirmation) {
                    return false;
                }

                dataSent = false;

                var buttons = [];

                for (var i = 0; i < response.buttons.length; i++) {
                    buttons.push({
                        id: "alert_button" + i,
                        text: response.buttons[i],
                        type: "custom",
                        click: onButtonClick
                    });
                }
                if (response.focusedButtonIndex && (0 <= response.focusedButtonIndex) && (response.focusedButtonIndex < buttons.length)) {
                    buttons[response.focusedButtonIndex].focused = true;
                }

                var dropDownItems = [];

                for (var i = 0; i < response.dropDownItems.length; i++) {
                    dropDownItems.push({
                        id: "dropDownItem" + i,
                        text: response.dropDownItems[i]
                    });
                }
                if (response.dropDownItemIndex && (0 <= response.dropDownItemIndex) && (response.dropDownItemIndex < buttons.length)) {
                    dropDownItems[response.dropDownItemIndex].selected = true;
                    presetStoreMode = response.dropDownItemIndex;
                } else {
                    presetStoreMode = 0;
                }

                $.alert({
                    title: response.tt,
                    message: response.ques,
                    buttons: buttons,
                    dropDown: {
                        label: response.msg,
                        items: dropDownItems,
                        onItemChanged: onItemChanged
                    },
                    onClose: onClose
                });
                return true;
            }
        };
    })();

    var LoginResultDataHandler = {
        name: "LoginResultDataHandler",
        handler: function (response) {
            if (response.responseType != Server.requestTypes.login) {
                return false;
            }
            window.login.GetLoginManager().onResultHandler(response.result);
            return true;
        }
    };

    var CommandLineDataHandler = {
        name: "CommandLineDataHandler",
        handler: function (response) {
            var cmdlineText = response.text;
            var cmdPrompt = response.prompt;
            var promptColor = response.promptcolor;

            var setCmdline = (cmdlineText !== undefined) || (cmdPrompt !== undefined) || (promptColor !== undefined);

            if (setCmdline && window.generic.globs.commandLine) {
                window.generic.globs.commandLine.render(cmdPrompt, promptColor, cmdlineText, true);
            }
            return setCmdline;
        }
    };

    DataHandlerManager.Register(CommandConfirmationDataHandler);
    DataHandlerManager.Register(PresetCommandConfirmationDataHandler);
    DataHandlerManager.Register(LoginResultDataHandler);
    DataHandlerManager.Register(CommandLineDataHandler);
})();


(function (ns) {
    var Dispatcher = function () {
        this._actions = {};
    };

    // action:
    // {
    //     type:"",
    //     handler: function(type, data){return false;}
    // }
    Dispatcher.prototype.register = function (actions) {
        if (Array.isArray(actions)) {
            for (var i = 0; i < actions.length; i++) {
                this._registerOne(actions[i]);
            }
        } else {
            this._registerOne(actions);
        }
    };

    Dispatcher.prototype._registerOne = function (action) {
        if (!action || !action.type || !action.handler) {
            warning("Dispatcher.register: Invalid argument 'actions'");
            return;
        }

        if (!this._actions[action.type]) {
            this._actions[action.type] = [];
        }

        this._actions[action.type].push(action.handler);
    };

    Dispatcher.prototype.unregister = function (actions) {
        if (Array.isArray(actions)) {
            for (var i = 0; i < actions.length; i++) {
                this._unregisterOne(actions[i]);
            }
        } else {
            this._unregisterOne(actions);
        }
    };

    Dispatcher.prototype._unregisterOne = function (action) {
        if (!action || !action.type || !action.handler) {
            warning("Dispatcher.unregister: Invalid argument 'action'");
            return;
        }

        var actionHandlers = this._actions[action.type];
        if (actionHandlers) {
            for (var i = 0; i < actionHandlers.length; i++) {
                if (actionHandlers[i] == action.handler) {
                    actionHandlers = actionHandlers.splice(i, 1);
                    break;
                }
            }
        }
    };

    // action:
    // {
    //     type:"",
    //     data: {}
    // }
    Dispatcher.prototype.trigger = function (action) {
        if (!action || !action.type) {
            warning("Dispatcher.trigger: Invalid argument 'action'");
            return;
        }

        var actionHandlers = this._actions[action.type];
        if (actionHandlers) {
            for (var i = 0; i < actionHandlers.length; i++) {
                actionHandlers[i](action.type, action.data);
            }
        }
    };

    ns.Dispatcher = function () { return new Dispatcher(); };
}(window));
