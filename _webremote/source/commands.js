defineNamespace(window, "commands");

(function(ns){
    var BasicCommandType = {
        set:                        { id: "SET",                  title: "Set", blinkid: "set", autoSubmit: true, press: true, release: false },
        previous:                   { id: "PREV",                 title: "Previous", press: false },
        next:                       { id: "NEXT",                 title: "Next", press: false },
        clear:                      { id: "CLEAR",                title: "Clear", blinkid: "clear", longClick: true, press: true },
        channelFixtureSwitcher:     { id: "FIXTURE_CHANNEL",      title: "Channel / Fixture / Dmx", press: true},
        fixtureGroupPresetSwitcher: { id: "FIXTURE_GROUP_PRESET", title: "Fixture / Group / Preset", press: true},
        execCueSwitch:              { id: "EXEC_CUE",             title: "Exec / Cue", press: true },
        storeUpdateSwitcher:        { id: "STORE_UPDATE",         title: "Store / Update", press: true },
        oops:                       { id: "OOPS",                 title: "Oops", press: true },
        esc:                        { id: "ESC",                  title: "ESC", press: true },
        _0:                         { id: "0",                    title: "0", press: true},
        _1:                         { id: "1",                    title: "1", press: true},
        _2:                         { id: "2",                    title: "2", press: true},
        _3:                         { id: "3",                    title: "3", press: true},
        _4:                         { id: "4",                    title: "4", press: true},
        _5:                         { id: "5",                    title: "5", press: true},
        _6:                         { id: "6",                    title: "6", press: true},
        _7:                         { id: "7",                    title: "7", press: true},
        _8:                         { id: "8",                    title: "8", press: true},
        _9:                         { id: "9",                    title: "9", press: true},
        dot:                        { id: "PUNKT",                title: ".", press: true },
        plus:                       { id: "PLUS",                 title: "+", press: true },
        minus:                      { id: "MINUS",                title: "-", press: true },
        thru:                       { id: "THRU",                 title: "Thru", press: true },
        _if:                        { id: "IF",                   title: "If", press: true },
        at:                         { id: "AT",                   title: "At", press: true },
        full:                       { id: "FULL",                 title: "Full", press: true },
        high:                       { id: "HIGH",                 title: "Highlight", blinkid: "high", autoSubmit: true, press: true },
        please:                     { id: "ENTER",                title: "Please", press: true },
        off:                        { id: "OFF",                  title: "Off", blinkid: "off", press: true },
        on:                         { id: "ON",                   title: "On", blinkid: "on", press: true },
        assign:                     { id: "ASSIGN",               title: "Assign", blinkid: "assign", press: true },
        label:                      { id: "LABEL",                title: "Label", blinkid: "label", press: true },
        copy:                       { id: "COPY",                 title: "Copy", blinkid: "copy", press: true },
        time:                       { id: "TIME",                 title: "Time", blinkid: "time", press: true },
        page:                       { id: "PAGE",                 title: "Page", blinkid: "page", press: true },
        macro:                      { id: "MACRO",                title: "Macro", blinkid: "macro", press: true },
        _delete:                    { id: "DELETE",               title: "Delete", blinkid: "delete", press: true },
        goto:                       { id: "GOTO",                 title: "Goto", blinkid: "goto", press: true },
        go:                         { id: "GO_PLUS",              title: "Go+", blinkid: "go", press: true },
        goback:                     { id: "GO_MINUS",             title: "Go-", blinkid: "goback", press: true },
        pause:                      { id: "PAUSE",                title: "Pause", blinkid: "pause", press: true },
        select:                     { id: "SELECT",               title: "Select", blinkid: "select", press: true },
        fixture:                    { id: "FIXTURE",              title: "Fixture", blinkid: "fixture", press: true },
        sequence:                   { id: "SEQU",                 title: "Sequence", blinkid: "sequence", press: true },
        cue:                        { id: "CUE",                  title: "Cue", blinkid: "cue", press: true },
        preset:                     { id: "PRESET",               title: "Preset", blinkid: "preset", press: true },
        edit:                       { id: "EDIT",                 title: "Edit", blinkid: "edit", press: true },
        update:                     { id: "UPDATE",               title: "Update", blinkid: "update", press: true },
        exec:                       { id: "EXEC",                 title: "Exec", blinkid: "exec", press: true },
        store:                      { id: "STORE",                title: "Store", blinkid: "store", press: true },
        group:                      { id: "GROUP",                title: "Group", blinkid: "group", press: true },
        progOnly:                   { id: "PROG_ONLY",            title: "Prg Only", blinkid: "po", autoSubmit: true, press: true },
        specialDialog:              { id: "SPECIAL_DIALOGUE",     title: "Special Dialogue", press: true },
        solo:                       { id: "SOLO",                 title: "Solo", blinkid: "solo", autoSubmit: true, press: true },
        odd:                        { id: "ODD",                  title: "Odd", press: true },
        even:                       { id: "EVEN",                 title: "Even", press: true },
        wings:                      { id: "WINGS",                title: "Wings", press: true },
        reset:                      { id: "RESET",                title: "Reset", press: true },
        _empty:                     { id: "",                     title: "", press: false },
    };
if(isDot2())
{
    var FullCommandType = $.extend({
        ma:                     { id: "MA",                 title: "", press: false },
        presetValue:            { id: "layerMode",          title: "", states: [
            { value: "Value", text: "Name", default: true },
            { value: "Output", text: "Value" }
        ]},
        progOnly:               { id: "PROG_ONLY",          title: "Prg Only", blinkid: "po", autoSubmit: true, press: true },
        featureSort:            { id: "featureSort",        title: "Feature Sort" },
        fixtureSort:            { id: "fixtureSort",        title: "Fixture Sort" },
        channelSort:            { id: "channelSort",        title: "Channel Sort" },
        hideName:               { id: "hideName",           title: "Hide name" },

        empty:                  { id: "" ,                  title: "", release: false },
    }, BasicCommandType);
}
else
{
    var FullCommandType = $.extend({
        ma:                     { id: "MA",                 title: "", press: false },
        presetValue:            { id: "layerMode",          title: "Preset Value", states: [
            { value: "Value", text: "Value", default: true },
            { value: "Fade", text: "Fade" },
            { value: "Delay", text: "Delay" },
            { value: "Output", text: "Output" }
        ]},
        progOnly:               { id: "PROG_ONLY",          title: "Prg Only", blinkid: "po", autoSubmit: true, press: true },
        featureSort:            { id: "featureSort",        title: "Feature Sort" },
        fixtureSort:            { id: "fixtureSort",        title: "Fixture Sort" },
        channelSort:            { id: "channelSort",        title: "Channel Sort" },
        hideName:               { id: "hideName",           title: "Hide name" },

        empty:                  { id: "" ,                  title: "", release: false },
    }, BasicCommandType);
}

    function getNextState(currentState) {
        if (this.states) {
            if (currentState === undefined) {
                return this.default;
            }

            for (var i = 0; i < this.states.length - 1; i++) {
                if(this.states[i].value == currentState.value){
                    return this.states[i+1];
                }
            }

            // if currentState is the last state, or currentState does not correspond to any state of this command type
            return this.states[0];
        } else {
            assert("called getNextState on stateless command " + this.id);
        }

        return undefined;
    }

    (function postProcessCommandType() {
        _.map(FullCommandType, processCommandType);
    })();

    function processCommandType(commandType) {
        if (!commandType.states || (commandType.states.length <= 0)) {
            commandType.states = [
                { value: false, default: true },
                { value: true }
            ];
        }

        for (var i = 0; i < commandType.states.length; i++) {
            if(commandType.states[i].default){
                commandType.default = commandType.states[i];
                break;
            }
        }

        if (commandType.default === undefined) {
            commandType.default = commandType.states[0];
        }

        commandType.getNextState = getNextState;

        if ((commandType.release === undefined) && (commandType.change === undefined)) {
            commandType.release = true;
        }

        return commandType;
    }

    function createCommandType(commandType) {
        if (!commandType) {
            return null;
        }
        commandType.id = commandType.id || generic.createGuid();
        return processCommandType(commandType);
    }

    function addCommandType(commandType) {
        if (!commandType) {
            return;
        }
        assert(FullCommandType[commandType.id] === undefined, "command type '" + commandType.title + "' already exists");

        FullCommandType[commandType.id] = commandType;
    }

    var Command = function(type, handler){
        this.m_type = type;
        this.execute = handler;
    };
    Command.prototype.getType = function() {
        return this.m_type;
    };
    Command.prototype.isDynamic = function() {
        return false;
    };

    var State = function(stateGetter, stateSetter) {
        var m_value = { value: undefined };
        if (!stateGetter && !stateSetter) {
            stateGetter = function() { return m_value; };
            stateSetter = function(value) { m_value = value };
        }
        this.m_getState = stateGetter;
        this.m_setState = stateSetter;
        this.m_dirty = false;
        this.$ = $(this);
        this.onValueChangedEventName = "onValueChanged";
    };
    State.prototype.init = function() {
        this.$.triggerHandler(this.onValueChangedEventName, { state: this.m_getState() });
    };
    State.prototype.getState = function() {
        if (!this.m_getState) {
            generic.statusLogging("State.m_getState is null");
            return;
        }
        return this.m_getState();
    };
    State.prototype.setState = function(state) {
        if (!this.m_setState) {
            generic.statusLogging("State.m_setState is null");
            return;
        }

        if (this.getState().value != state.value) {
            this.m_setState(state);
            this.$.triggerHandler(this.onValueChangedEventName, { state: state });
            this.m_dirty = true;
        }
    };
    State.prototype.isDirty = function() {
        return this.m_dirty;
    };
    State.prototype.clean = function() {
        this.m_dirty = false;
    };
    State.prototype.on = function(handler, parameters) {
        this.$.on(this.onValueChangedEventName, parameters, handler);
    };
    State.prototype.off = function(handler) {
        if (handler) {
            this.$.off(this.onValueChangedEventName, handler);
        } else {
            this.$.off(this.onValueChangedEventName);
        }
    };

    var StateCommand = function(type, handler, stateGetter, stateSetter) {
        this.m_type = type;
        this.execute = handler;
        if (stateGetter) {
            stateGetter = stateGetter.bind(this, this.m_type);
        }
        if (stateSetter) {
            stateSetter = stateSetter.bind(this, this.m_type);
        }

        this.m_state = new State(stateGetter, stateSetter);
        if (this.getState().value === undefined) {
            this.setState(this.m_type.default);
        }
    };
    StateCommand.prototype.init = function() {
        this.m_state.init();
    }
    StateCommand.prototype.getType = function() {
        return this.m_type;
    };
    StateCommand.prototype.isDynamic = function() {
        return true;
    };
    StateCommand.prototype.getState = function() {
        return this.m_state.getState();
    };
    StateCommand.prototype.setState = function(state) {
        this.m_state.setState(state);
    };
    StateCommand.prototype.isDirty = function() {
        return this.m_state.isDirty();
    };
    StateCommand.prototype.clean = function() {
        this.m_state.clean();
    };
    StateCommand.prototype.on = function(handler, parameters) {
        this.m_state.on(handler, parameters);
    };
    StateCommand.prototype.off = function(handler) {
        this.m_state.off(handler, parameters);
    };

    ns.Command = function(type, handler) { return new Command(type, handler); };
    ns.StateCommand = function(type, handler, stateGetter, stateSetter) { return new StateCommand(type, handler, stateGetter, stateSetter); };

    function commandExecute(command, eventType) {
        var value = -1;
        if (eventType === Touch.maTouchUp) {
            value = 0;
        } else if (eventType === Touch.maTouchDown) {
            value = 1;
        }

        if (value >= 0) {
            window.generic.globs.commandLine.do({ keyname: command.getType().id, value: value, autoSubmit: command.getType().autoSubmit });
        }
    }

    function createDefaultCommand(commandClass, commandType, commandExecute){
        return function() { return commandClass(commandType, commandExecute); };
    }

    var DefaultCommands = {};
    for(var name in BasicCommandType){
        var commandType = BasicCommandType[name];
        var commandClass = null;
        if (commandType.blinkid) {
            commandClass = ns.StateCommand;
        } else {
            commandClass = ns.Command;
        }
        DefaultCommands[name] = createDefaultCommand(commandClass, commandType, commandExecute);
    }

    DefaultCommands["empty"] = createDefaultCommand(ns.Command, FullCommandType.empty, function(){});

    ns.defaultCommandHandler = commandExecute;
    ns.createCommandType = createCommandType;
    ns.addCommandType = addCommandType;
    ns.CommandType = FullCommandType;
    ns.Commands = DefaultCommands;
    ns.State = State;
})(window.commands);

defineNamespace(window, "commands.ui");
(function(ns){
    //**************** UICommandPresenters *******************//
    var DefaultUICommandPresenter = {
        getView : function(commandType, currentState) {
            var result = {};
            if ((currentState === undefined) || (currentState === null) || (currentState.value === undefined) || (currentState.value === null)) {
                result.text = commandType.title;
            } else if ((currentState.value === true) || (currentState.value === false)) {
                result.highlighted = currentState.value;
                result.text = commandType.title;
            } else {
                result.text = currentState.text;
                result.value = currentState.value;
            }
            return result;
        }
    };

    var UIPresetValueCommandPresenter = {
        uiStates: $.extend({}, remoteColors.presetValues),
        getView: function(commandType, currentState) {
            if(isDot2())
            {
                return $.extend({
                    "image":"./images/d2ui_values_only.png",
                    checked: currentState.value == "Output" ? true : false
                }, this.uiStates[currentState.value]);
            }
            else
            {
                return $.extend({
                    "text": commandType.title + " (" + currentState.text + ")"
                }, this.uiStates[currentState.value]);
            }
        }
    };

    var UIMACommandPresenter = {
        uiStates: {
            true: { image: "./images/ma_logo_checked.png" },
            false: { image: "./images/ma_logo.png" }
        },
        getView: function(commandType, currentState) {
            return $.extend({
                checked: currentState.value
            }, this.uiStates[currentState.value]);
        }
    };

    var UICommandPresenterMap = {
        default: DefaultUICommandPresenter
    };
    UICommandPresenterMap[commands.CommandType.presetValue.id] = UIPresetValueCommandPresenter;
    UICommandPresenterMap[commands.CommandType.ma.id] = UIMACommandPresenter;

    var getUICommandPresenter = function(commandType) {
        return UICommandPresenterMap[commandType.id] || UICommandPresenterMap.default;
    };

    //**************** UICommandElements *******************//
    var UICommandElement = function() {

    };
    UICommandElement.prototype.init = function(command) {
        this.m_command = command;
        this.m_presenter = getUICommandPresenter(command.getType());

        if (this.m_$item) {
            this.dispose();
        }

        this.m_$item = null;
        var eventsArray = [];
        var cmdType = this.m_command.getType();
        if (cmdType.press) {
            eventsArray.push(Touch.maTouchDown);
        }
        if (cmdType.release) {
            eventsArray.push(Touch.maTouchUp);
        }
        if (cmdType.longPress) {
            eventsArray.push(Touch.maLongTap);
        }
        if (cmdType.change) {
            eventsArray.push('change');
        }
        this.m_events = eventsArray.join(" ");

        this.m_handler = (function(event, value) {
            this.m_command.execute(this.m_command, event.type, value);
        }).bind(this);
    };
    UICommandElement.prototype.getItem = function() {
        return this.m_$item;
    };
    UICommandElement.prototype.update = function(state) {};

    var UILabel = function() {
        UILabel.superclass.constructor.call(this);
    };
    generic.extend(UILabel, UICommandElement);
    UILabel.prototype.init = function(command) {
        UILabel.superclass.init.call(this, command);

        this.m_$item = $("<div class='commandbutton'><span class='content'></span></div>");
        this.m_$item.on(this.m_events, this.m_handler);

        this.update(null);
    };
    UILabel.prototype.update = function(state) {
        var view = this.m_presenter.getView(this.m_command.getType(), state);
        $(".content", this.m_$item).text(view.text);
    };
    UILabel.prototype.dispose = function() {
        this.m_$item.off(this.m_events, this.m_handler);
    };

    var UIMultiStateButton = function() {
        UIMultiStateButton.superclass.constructor.call(this);
    };
    generic.extend(UIMultiStateButton, UICommandElement);
    UIMultiStateButton.prototype.init = function(command) {
        UIMultiStateButton.superclass.init.call(this, command);

        this.m_$item = $("<div class='commandbutton'><span class='content'></span></div>");
        this.m_$item.on(this.m_events, this.m_handler);

        this.update(this.m_command.getState ? this.m_command.getState() : undefined);
    };
    UIMultiStateButton.prototype.update = function(state) {
        var view = this.m_presenter.getView(this.m_command.getType(), state);
        if (view.highlighted) {
            this.m_$item.addClass("highlighted");
        } else if (view.highlighted === false){
            this.m_$item.removeClass("highlighted");
        }

        if (view.checked) {
            this.m_$item.addClass("checked");
        } else if (view.checked === false){
            this.m_$item.removeClass("checked");
        }

        $(".content", this.m_$item).text(view.text);
    };
    UIMultiStateButton.prototype.dispose = function() {
        this.m_$item.off(this.m_events, this.m_handler);
    };

    var UIRadioStateButton = function() {
        UIRadioStateButton.superclass.constructor.call(this);

        //this.m_containerTemplate = '<div data-type="radio-button-group" class="radioButtons"></div>';
        this.m_itemTemplateChecked = _.template('<div data-type="radio-button" data-value="<%= value %>"> \
                <input type="radio" id="radio-<%= value %>" name="radio-name-<%= id %>" checked data-type="marker"> \
                <label for="radio-<%= value %>" data-type="label"> \
                    <span class="content"><%= text %></span> \
                </label> \
            </div>');

        this.m_itemTemplate = _.template('<div data-type="radio-button" data-value="<%= value %>"> \
                <input type="radio" id="radio-<%= value %>" name="radio-name-<%= id %>" data-type="marker"> \
                <label for="radio-<%= value %>" data-type="label"> \
                    <span class="content"><%= text %></span> \
                </label> \
            </div>');
    };
    generic.extend(UIRadioStateButton, UICommandElement);
    UIRadioStateButton.prototype.init = function(command) {
        UIRadioStateButton.superclass.init.call(this, command);

        assert(this.m_command.m_type.states && this.m_command.m_type.states.length, "UIRadioStateButton was initialized with stateless command", true);

        var activeState = this.m_command.m_state.getState();

        this.m_$item = $("<div></div>"); //$(this.m_containerTemplate);
        for (var i = 0; i < this.m_command.m_type.states.length; i++) {
            var state = this.m_command.m_type.states[i];
            var $item = null;
            if(state.value == activeState.value)
            {
                $item = $(this.m_itemTemplateChecked({
                    text: state.text,
                    value: state.value,
                    id: this.m_command.m_type.id
                }));
            }
            else
            {
                $item = $(this.m_itemTemplate({
                    text: state.text,
                    value: state.value,
                    id: this.m_command.m_type.id
                }));
            }
            initItem($item, this.m_events, this.m_handler, state);
            this.m_$item.append($item);
        }

        this.m_$buttons = $("[data-type=radio-button]", this.m_$item);
    };
    function initItem ($item, events, handler, value) {
        $item.on(events, function(event) {
            handler(event, value);
        });
    }
    UIRadioStateButton.prototype.getItem = function() {
        return this.m_$buttons;
    };
    UIRadioStateButton.prototype.dispose = function() {
        this.m_$buttons.off(this.m_events, this.m_handler);
    };

    var UIStateImageButton = function() {
        UIStateImageButton.superclass.constructor.call(this);
    };
    generic.extend(UIStateImageButton, UICommandElement);
    UIStateImageButton.prototype.init = function(command) {
        UIStateImageButton.superclass.init.call(this, command);

        this.m_$item = $("<div class='commandbutton'><span class='content'><img class='logo'/></span></div>");
        this.m_$item.on(this.m_events, this.m_handler);
        this.update(this.m_command.getState ? this.m_command.getState() : undefined);
    };
    UIStateImageButton.prototype.update = function(state) {
        var view = this.m_presenter.getView(this.m_command.getType(), state);
        if (view.checked) {
            this.m_$item.addClass("checked");
        } else if (view.checked === false){
            this.m_$item.removeClass("checked");
        }
        $(".logo", this.m_$item).attr("src", view.image);
    };
    UIStateImageButton.prototype.dispose = function() {
        this.m_$item.off(this.m_events, this.m_handler);
    };

    var UIDropDown = function() {
        UIDropDown.superclass.constructor.call(this);

        this.m_dropDownSignURL = "./images/dropDownSign.svg";
    };
    generic.extend(UIDropDown, UICommandElement);
    UIDropDown.prototype.init = function(command) {
        UIDropDown.superclass.init.call(this, command);

        this.m_$item = $('<div class="drop-down"><div class="button-content"><span class="content"></span></div><embed data-rel="drop-down-sign" class="dropDownSign" type="image/svg+xml" src="' + this.m_dropDownSignURL + '"></embed></div>');
        this.m_innerDropDown = new window.uiTypes.DropDownButton(this.m_$item);

        this.m_$container = $('<div class="drop-down-container"></div>');
        this.m_$items = command.getType().states.map((function(item){
            var $item = $("<div class='drop-down-item'><span class='content'>" + item.text + "</span></div>");
            $item.on(this.m_events, (function (event) {
                this.m_handler(event, item);
                this.m_innerDropDown.close();
            }).bind(this));
            return $item;
        }).bind(this));

        this.m_innerDropDown.updateListData(this.m_$items);

        this.m_innerDropDown.init({
            OnTap: this.m_handler,
            canExecuteDropDown: function() {return true;},
            $container: this.m_$container,
            createItem: function(item){return item;}
        });

        this.update(this.m_command.getState ? this.m_command.getState() : undefined);
    };
    UIDropDown.prototype.update = function(state) {
        var view = this.m_presenter.getView(this.m_command.getType(), state);
        this.m_innerDropDown.rename(view.text);
        $(".button-content", this.m_$item).css("background-color", view.activeBackgroundColor);
        $(".button-content", this.m_$item).css("border-color", view.borderColor);
        this.m_$container.css("border-color", view.borderColor);
    };
    UIDropDown.prototype.dispose = function() {
        if (this.m_innerDropDown) {
            this.m_innerDropDown.dispose();
            this.m_innerDropDown = null;
        }

        for (var i = 0; i < this.m_$items.length; i++) {
            this.m_$items[i].off(this.m_events);
        }
    };

    ns.UICommandElement = function() { return new UICommandElement(); };
    ns.UILabel = function() { return new UILabel(); };
    ns.UIMultiStateButton = function() { return new UIMultiStateButton(); };
    ns.UIStateImageButton = function() { return new UIStateImageButton(); };
    ns.UIDropDown = function() { return new UIDropDown(); };
    ns.UIRadioStateButton = function () { return new UIRadioStateButton(); };
    ns.initCommandUIElementPair = function(element, index, array) {
        element.uiElement.init(element.command);
    };
    ns.fetchUIElementItems = function(commandUIElementPair) {
        return { $item: commandUIElementPair.$item || commandUIElementPair.uiElement.getItem() };
    };
    ns.disposeUIElements = function(uiElements) {
        uiElements.forEach(function(element, index, array) {
            if(element.uiElement) {
                element.uiElement.dispose();
            }
        });
    };
    ns.defaultCommandExecute = function(command, eventType, value){
        var newValue = null;
        if (value === undefined) {
            var commandState = command.getState();
            newValue = command.getType().getNextState(commandState);
        } else {
            newValue = value;
        }

        command.setState(newValue);
    };
})(window.commands.ui);

(function(ns){
    var GlobalTimers = window.timers.GlobalTimers;

    var CommandManager = function() {
        this.m_commands = [];
        this.m_commandGroupHash = {};

        this.m_blinkState = 0;

        this.m_refreshTimer_context = this.refreshTimer.bind(this);
        this.m_blinkTimer_context = this.blinkTimer.bind(this);
    };

    CommandManager.prototype.refreshCommandArray = function(clear) {
        this.m_commands.length = 0;

        for(var item in this.m_commandGroupHash){
            var commandGroup = this.m_commandGroupHash[item];
            for (var i = 0; i < commandGroup.length; i++) {
                if (commandGroup[i].command.isDynamic()) {
                    this.m_commands.push(commandGroup[i]);
                }
            }
        }
    };

    CommandManager.prototype.addCommands = function(groupName, cmds) {
        var startTimer = (this.m_commands.length <= 0) && (cmds.length > 0);

        if (this.m_commandGroupHash[groupName]) {
            window.generic.statusLogging("Command Group " + groupName + " already exists and will be replaced");
            delete this.m_commandGroupHash[groupName];
        }
        this.m_commandGroupHash[groupName] = cmds;

        this.refreshCommandArray();

        if (startTimer) {
            GlobalTimers.AddRefreshTimerEventHandler(this.m_refreshTimer_context);
            GlobalTimers.AddBlinkTimerEventHandler(this.m_blinkTimer_context);
        }
    };

    CommandManager.prototype.removeCommands = function(groupName) {
        if (this.m_commandGroupHash[groupName]) {
            delete this.m_commandGroupHash[groupName];
        } else {
            window.generic.statusLogging("Attempt to remove nonexisting command group " + groupName);
            return;
        }

        var hadCommands = this.m_commands.length > 0;
        this.refreshCommandArray();
        var stopTimer = hadCommands && (this.m_commands.length <= 0);
        if (stopTimer) {
            GlobalTimers.RemoveRefreshTimerEventHandler(this.m_refreshTimer_context);
            GlobalTimers.RemoveBlinkTimerEventHandler(this.m_blinkTimer_context);
        }
    };

    CommandManager.prototype.refreshTimer = function() {
        for (var i = 0; i < this.m_commands.length; i++) {
            var stateCommand = this.m_commands[i];
            if (stateCommand.command.getState().value === "b") {
                stateCommand.uiElement.update({ value : this.m_blinkState });
            } else if(stateCommand.command.isDirty()){
                stateCommand.uiElement.update(stateCommand.command.getState());
            }
        }

        this.m_commands.forEach(clearState);
    };

    function clearState(stateCommand, index, array) {
        stateCommand.command.clean();
    }

    CommandManager.prototype.blinkTimer = function() {
        this.m_blinkState = !this.m_blinkState;
    };

    CommandManager.prototype.dispose = function() {
        GlobalTimers.RemoveRefreshTimerEventHandler(this.m_refreshTimer_context);
        GlobalTimers.RemoveBlinkTimerEventHandler(this.m_blinkTimer_context);
    };

    var ServerCommandManager = function() {
        ServerCommandManager.superclass.constructor.call(this);

        this.m_buttonStateDataHandler = {
            name: "ButtonStateDataHandler",
            handler: (function (response) {
                if (response.responseType != Server.requestTypes.getdata) {
                    return false;
                }

                if (this.m_commands.length > 0) {
                    this.dataHandler(response.data);
                }
                return true;
            }).bind(this)
        };

        DataHandlerManager.Register(this.m_buttonStateDataHandler);
    };
    generic.extend(ServerCommandManager, CommandManager);

    ServerCommandManager.prototype.blinkTimer = function() {
        ServerCommandManager.superclass.blinkTimer.call(this);

        var blinkCommands = [];
        for (var i = 0; i < this.m_commands.length; i++) {
            if (this.m_commands[i].command.getType().blinkid) {
                blinkCommands.push(this.m_commands[i].command.getType().blinkid);
            }
        }

        if (blinkCommands.length > 0) {
            Server.send({
                requestType: Server.requestTypes.getdata,
                data: blinkCommands.join(",")
            });
        }
    };

    ServerCommandManager.prototype.dataHandler = function (dataArray) {
        for (var i = 0; i < dataArray.length; i++) {
            for(var key in dataArray[i]) {
                var val = dataArray[i][key];
                // TODO: optimize
                for (var j = 0; j < this.m_commands.length; j++) {
                    if(this.m_commands[j].command.getType().blinkid === key){
                        if (val === "0") {
                            val = false;
                        } else if (val === "1") {
                            val = true;
                        }
                        if (this.m_commands[j].command.getState().value !== val) {
                            this.m_commands[j].command.setState({ value: val });
                        }
                    }
                }
            }
        }
    };

    ServerCommandManager.prototype.dispose = function() {
        DataHandlerManager.Unregister(this.m_buttonStateDataHandler.name);
    };

    ns.CommandManager = CommandManager;
    ns.ServerCommandManager = ServerCommandManager;
})(window.commands);
