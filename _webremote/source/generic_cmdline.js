window.uiTypes.CommandLineComponent = (function () {
    var config = generic.globs.config;

    var CommandLineComponent = React.createClass({
        getInitialState: function() {
            return {
                prompt: "",
                command: "",
                promptColor: remoteColors.commandLine.color,
                dirty: false
            };
        },
        shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
            this.state.dirty = nextState.dirty;

            return (this.state.prompt != nextState.prompt) || (this.state.command != nextState.command) || (this.state.promptColor != nextState.promptColor);
        },
        render: function render() {
            this.state.dirty = true;

            if(window.isDot2())
            {
                return <div className="command-line-holder" ref="cmdline">
                    <input className="cmdline-input" type="text" placeholder="Command Line" ref="cmdlineTextbox" />
                </div>;
            }
            else
            {
                return <div className="command-line-holder" ref="cmdline">
                    <img className="cmdline-history-button" ref="historyButton" alt="history" src="images/btncontext.png"/>
                    <div className="cmdline-prompt" ref="cmdlinePrompt">{ this.state.prompt }</div>
                    <input className="cmdline-input" type="text" ref="cmdlineTextbox" />
                </div>;
            }
        },
        componentDidMount: function() {
            var cmdlineTextbox = React.findDOMNode(this.refs.cmdlineTextbox);
            cmdlineTextbox.addEventListener("keyup", this.onKeyUp);

            document.addEventListener("keypress", this.onKeyPress);

            if(window.isDot2())
            {
                cmdlineTextbox.addEventListener(Touch.maTouchUp, this.onHistoryButtonPress);
            }
            else
            {
                var historyButton = React.findDOMNode(this.refs.historyButton);
                historyButton.addEventListener(Touch.maTouchUp, this.onHistoryButtonPress);
            }
        },
        componentWillUnmount: function () {
            var cmdlineTextbox = React.findDOMNode(this.refs.cmdlineTextbox);
            cmdlineTextbox.removeEventListener("keyup", this.onKeyUp);

            document.removeEventListener("keypress", this.onKeyPress);

            if(window.isDot2())
            {
                cmdlineTextbox.removeEventListener(Touch.maTouchUp, this.onHistoryButtonPress);
            }
            else
            {
                var historyButton = React.findDOMNode(this.refs.historyButton);
                historyButton.removeEventListener(Touch.maTouchUp, this.onHistoryButtonPress);
            }
        },
        componentDidUpdate: function() {
            var cmdlineTextbox = React.findDOMNode(this.refs.cmdlineTextbox);
            var cmdlinePrompt= React.findDOMNode(this.refs.cmdlinePrompt);

            if(cmdlinePrompt)
            {
                cmdlinePrompt.style.color = this.state.promptColor;
            }
            cmdlineTextbox.value = this.state.command;
        },
        onKeyPress: function onKeyPress(eventObject) {
            var cmdlineTextbox = React.findDOMNode(this.refs.cmdlineTextbox);

            var charCode = eventObject.charCode;
            if (config.keyboardCaptured) {
                // Any keyboard input has to be redirected to cmdline
                if ((cmdlineTextbox != document.activeElement) && charCode && (charCode != 13)) {
                    cmdlineTextbox.focus();
                    // Firefox behaves differently from other browsers
                    // It ignores the current input symbol and only sets focus to the textbox
                    // For the sameness, prevent event propagation and manually set the symbol to the textbox
                    this.setState( { command: this.state.command + '' + String.fromCharCode(charCode) });
                    eventObject.preventDefault();
                }
            }
        },
        onKeyUp: function onKeyUp(eventObject) {
            var cmdlineTextbox = React.findDOMNode(this.refs.cmdlineTextbox);
            var command = cmdlineTextbox.value;
            var keyCode = eventObject.keyCode;

            if (config.keyboardCaptured) {
                this.setState( { command: cmdlineTextbox.value });

                var commandFunction = this.keyToCommandMap[keyCode];
                var commandObject = commandFunction ? commandFunction(command) : undefined;
                if (commandObject) {
                    if (this.props.dispatcher) {
                        this.props.dispatcher.trigger({
                            type: this.props.dispatcher.actions.COMMAND_ENTER,
                            data: commandObject
                        });
                    }

                    this.setState( { dirty: false });
                }
            }
        },
        keyToCommandMap: {
            13: function(command) {
                return { command: command };
            },
            27: function(command) {
                return { command: "ESC" };
            },
            38: function(command) {
                return { keyname: "UP", value: 1 };
            },
            40: function(command) {
                return { keyname: "DOWN", value: 1 };
            }
        },
        onHistoryButtonPress: function () {
            if (this.props.dispatcher) {
                this.props.dispatcher.trigger({
                    type: this.props.dispatcher.actions.HISTORY_BUTTON_PRESSED
                });
            }
        },
        getCommand: function getCommand() {
            return this.state.command;
        },
        getDirty: function getDirty() {
            return this.state.dirty;
        }
    });

    return CommandLineComponent;
})();


window.uiTypes.CommandLine = (function () {

    var CommandLine = function(container){
        this.m_container = container;
        this.m_dispatcher = Dispatcher();
    };

    CommandLine.prototype.init = function () {
        this.cmdlineComponent = React.render(React.createElement(window.uiTypes.CommandLineComponent, {dispatcher: this.m_dispatcher}), this.m_container);

        this.m_dispatcher.actions = {
            COMMAND_ENTER: "COMMAND_ENTER",
            HISTORY_BUTTON_PRESSED: "HISTORY_BUTTON_PRESSED"
        };

        this.m_actions = [{
            type: this.m_dispatcher.actions.COMMAND_ENTER,
            handler: this.onCommandEnter
        }, {
            type: this.m_dispatcher.actions.HISTORY_BUTTON_PRESSED,
            handler: this.onHistoryButtonPressed
        }];

        this.m_dispatcher.register(this.m_actions);
    };

    CommandLine.prototype.dispose = function () {
        this.m_dispatcher.unregister(this.m_actions);
        this.m_actions = null;

        React.unmountComponentAtNode(this.m_container);
    };

    CommandLine.prototype.render = function (prompt, promptColor, command, force_text) {
        var state = {};
        if (prompt && (prompt.length > 0)) {
            state.prompt = prompt;
        }
        if (promptColor) {
            state.promptColor = promptColor;
        }
        if (force_text || (command && (command.length > 0))) {
            state.command = command || "";
            log("Command Line set command: " + command);
        }

        this.cmdlineComponent.setState(state);

    };

    CommandLine.prototype.do = function(data){
        if (this.cmdlineComponent.getDirty()) {
            data.cmdlineText = this.cmdlineComponent.getCommand();
            this.cmdlineComponent.setState({dirty: false});
        }

        Server.send(data);
    };

    CommandLine.prototype.getText = function () {
        return this.cmdlineComponent.getCommand();
    };

    CommandLine.prototype.clear = function () {
        this.cmdlineComponent.setState({command: ""});
    };

    CommandLine.prototype.onCommandEnter = function onCommandEnter(type, data) {
        Server.send(data);
    };

    CommandLine.prototype.onHistoryButtonPressed = function onHistoryButtonPressed() {
        window.generic.globs.pageManager.TogglePage(window.uiTypes.pages.CommandHistory.id, {modal:true});
    };

    CommandLine.prototype.isEmpty = function(value){
        return this.getText().length === 0;
    };

    return CommandLine;
})();
