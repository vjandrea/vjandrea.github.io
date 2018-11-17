defineNamespace(window, "window.uiTypes.pages");

(function() {
    var hasChanged = window.utilities.hasChanged;
    var checkAndSet = window.utilities.checkAndSet;
    var PlaybacksDispatcher = Dispatcher();
    var actions = {
        SLIDER_ACTION: "slider_action",
        EXEC_BUTTON_ACTION: "exec_button_action"
    };

    var PlaybacksViewMode = {
        none: 0,
        main: 1,
        faders: 2,
        buttons: 3,
        channels: 4
    };
    var PlaybackButtonsViewMode = {
        simple: 0,
        includeButton0: 1,
        includeAllButtons: 2
    };
    var PlaybackExecButtonViewMode = {
        short: 1,
        extended: 2
    };

    if(isDot2())
    {
        window.execIconList = [
            {
                Keyword:"EmptyFlash",
                Image:"images/d2ui_empty_exec_button_flash_up.png"
            },
            {
                Keyword:"EmptyGo",
                Image:"images/d2ui_empty_exec_button_go.png"
            },
            {
                Keyword:"Black",
                Image:"images/d2ui_render_tools_playback_black.png"
            },
            {
                Keyword:"DS",
                Image:"images/d2ui_render_tools_playback_double_rate.png"
            },
            {
                Keyword:"Flash",
                Image:"images/d2ui_render_tools_playback_flash.png"
            },
            {
                Keyword:"Go",
                Image:"images/d2ui_render_tools_playback_go_forward.png"
            },
            {
                Keyword:"GoBack",
                Image:"images/d2ui_render_tools_playback_go_back.png"
            },
            {
                Keyword:"HS",
                Image:"images/d2ui_render_tools_playback_half_rate.png"
            },
            {
                Keyword:"Learn",
                Image:"images/d2ui_render_tools_playback_learn.png"
            },
            {
                Keyword:"Off",
                Image:"images/d2ui_render_tools_playback_off.png"
            },
            {
                Keyword:"On",
                Image:"images/d2ui_render_tools_playback_on.png"
            },
            {
                Keyword:"Pause",
                Image:"images/d2ui_render_tools_playback_pause.png"
            },
            {
                Keyword:"Rate1",
                Image:"images/d2ui_render_tools_playback_rate1.png"
            },
            {
                Keyword:"Select",
                Image:"images/d2ui_render_tools_playback_select_fixtures.png"
            },
            {
                Keyword:"Swap",
                Image:"images/d2ui_render_tools_playback_swop.png"
            },
            {
                Keyword:"Temp",
                Image:"images/d2ui_render_tools_playback_temp.png"
            },
            {
                Keyword:"Toggle",
                Image:"images/d2ui_render_tools_playback_toggle.png"
            }
        ];

        window.getExecImage = function(keyword,btn1,isLabel)
        {
            if(keyword == "Empty" && !isLabel)
            {
                if(btn1)
                {
                    return execIconList[1].Image;
                }
                else
                {
                    return execIconList[0].Image;
                }
            }
            else if(keyword == "Empty" && isLabel)
            {
                return "noLabel";
            }
            else
            {
                for(var i = 0; i < window.execIconList.length; i++)
                {
                    if(window.execIconList[i].Keyword == keyword)
                    {
                        return window.execIconList[i].Image;
                    }
                }
            }
            log("Failed to get Image for the Keyword: "+keyword);
            return 0;
        }
    }

    (function (ns) {
        var GlobalTimers = window.timers.GlobalTimers;
        var PageBase = window.uiTypes.pages.Page;
        var DataHandlerManager = window.DataHandlerManager;

        var Playbacks = function (commandLine, commandExecutor, globalSettings) {
            Playbacks.superclass.constructor.call(this, commandLine, commandExecutor, globalSettings);

            if(isDot2())
            {
                this.kItemsInBlockCount = 1;
            }
            else
            {
                this.kItemsInBlockCount = 5;
            }

            this.requirements = {
                noFooter: true,
                presetTypeBar: false,
                playbacksBar: true
            };

            this.pageNavigationModel = {};
            if(isDot2())
            {
                /*this.pageNavigationModel[PlaybacksViewMode.main] = {
                    t: "Main",
                    v: PlaybacksViewMode.main,
                    a: true,
                    //Fader,btn101, btn201, main
                    itemsType: [PlaybacksViewMode.faders,PlaybacksViewMode.buttons,PlaybacksViewMode.buttons,PlaybacksViewMode.main],
                    itemsCount: [6,6,6,1],
                    itemsStep: [6,6,6,0],
                    itemsIndexOffset: [0,101,201,0],
                    pagesCount: 0,
                    pagesStep: [1]
                };*/

                this.pageNavigationModel[PlaybacksViewMode.faders] = {
                    t: "Fader Wing",
                    v: PlaybacksViewMode.faders,
                    a: false,
                    //Fader,btn107, btn207
                    itemsType: [PlaybacksViewMode.faders,PlaybacksViewMode.buttons,PlaybacksViewMode.buttons],
                    itemsCount: [22,22,22],
                    itemsStep: [8,8,8],
                    itemsIndexOffset: [1,101,201],
                    pagesCount: 2,
                    pagesStep: [1]
                };

                this.pageNavigationModel[PlaybacksViewMode.buttons] = {
                    t: "Button Wing",
                    v: PlaybacksViewMode.buttons,
                    a: false,
                    //btn301,btn401,btn501,btn601,btn701,btn801
                    itemsType: [PlaybacksViewMode.buttons,PlaybacksViewMode.buttons,PlaybacksViewMode.buttons,PlaybacksViewMode.buttons,PlaybacksViewMode.buttons,PlaybacksViewMode.buttons],
                    itemsCount: [16,16,16,16,16,16],
                    itemsStep: [8,8,8,8,8,8],
                    itemsIndexOffset: [301,401,501,601,701,801],
                    pagesCount: 2,
                    pagesStep: [1]
                };
            }
            else
            {
                this.pageNavigationModel[PlaybacksViewMode.faders] = {
                    t: "Fader",
                    v: PlaybacksViewMode.faders,
                    a: true,

                    itemsType: [PlaybacksViewMode.faders],
                    itemsCount: [90],
                    itemsStep: [0],
                    itemsIndexOffset: [0],
                    pagesCount: 0,
                    pagesStep: [1]
                };

                this.pageNavigationModel[PlaybacksViewMode.buttons] = {
                    t: "Button",
                    v: PlaybacksViewMode.buttons,
                    a: false,

                    itemsType: [PlaybacksViewMode.buttons],
                    itemsCount: [90],
                    itemsStep: [0],
                    itemsIndexOffset: [0],
                    pagesCount: 0,
                    pagesStep: [1]
                };
            }

            this.accessDenied = false;

            this.__pageSizeChanged_context = null;
            this.__requestData_context = null;
            this.__dataResponseReady_context = null;

            this.__sliderMoved_context = null;
            this.__buttonPressed_context = null;

            this.__refresh_context = null;

            this.__pageInitialized = false;
        };
        window.generic.extend(Playbacks, PageBase);

        Playbacks.id = "Playbacks";
        if(isDot2())
        {
            Playbacks.title = "Virtual Playback";
        }
        else
        {
            Playbacks.title = "Playbacks";
        }
        Playbacks.content = '<div id="' + Playbacks.id + '" class="playbacks"></div>';
        Playbacks.storage = Storage.AddSection(Playbacks.id);
        Playbacks.controls = {};

        Playbacks.prototype.Init = function () {
            Playbacks.superclass.Init.call(this);

            if (!this.__dataResponseReady_context) {
                this.__dataResponseReady_context = this.__dataResponseReady.bind(this);
                DataHandlerManager.Register({ name: this.id + "DataHandler", handler: this.__dataResponseReady_context });
            }

            if (!this.__sliderMoved_context) {
                this.__sliderMoved_context = this.__sliderMoved.bind(this);
                PlaybacksDispatcher.register({ type: actions.SLIDER_ACTION, handler: this.__sliderMoved_context });
            }

            if (!this.__buttonPressed_context) {
                this.__buttonPressed_context = this.__buttonPressed.bind(this);
                PlaybacksDispatcher.register({ type: actions.EXEC_BUTTON_ACTION, handler: this.__buttonPressed_context });
            }

            Playbacks.controls.pagesNavigationBar = Playbacks.controls.pagesNavigationBar || new window.uiTypes.PlaybacksDataControl(Playbacks.storage);
            this.pagesNavigationBar = Playbacks.controls.pagesNavigationBar;
            this.pagesNavigationBar.setDispatcher(PlaybacksDispatcher);
            this.pagesNavigationBar.init(this.pageNavigationModel);
            this.pagesNavigationBar.activate();
            this.$this.triggerHandler(PageBase.events.optionsPanelChanged, this.pagesNavigationBar);

            var currentMode = this.pagesNavigationBar.getMode();

            var windowInitialized = this.initWindow(this.pagesNavigationBar.getMode().v || currentMode.v);
            this.window.refresh();
        };

        Playbacks.prototype.initWindow = function (mode, accessDenied) {
            if (this.window) {
                if (accessDenied && (this.window == Playbacks.controls.fallbackWindow)) {
                    return false;
                }

                if (!accessDenied) {
                    if( (mode == PlaybacksViewMode.faders) && (this.window == Playbacks.controls.fadersWindow) ) {
                        return false;
                    }

                    if( (mode == PlaybacksViewMode.buttons) && (this.window == Playbacks.controls.buttonsWindow) ) {
                        return false;
                    }

                    if( (mode == PlaybacksViewMode.main) && (this.window == Playbacks.controls.mainWindow) ) {
                        return false;
                    }
                }

                this.disposeWindow();
            }

            if (accessDenied) {
                this.window = Playbacks.controls.fallbackWindow = Playbacks.controls.fallbackWindow || new window.uiTypes.FallbackWindow(this.$page, this.m_commandLine);
            } else {
                if (mode == PlaybacksViewMode.faders) {
                    this.window = Playbacks.controls.fadersWindow = Playbacks.controls.fadersWindow || new window.uiTypes.FadersWindow(this.$page, this.m_commandLine);
                } else if (mode == PlaybacksViewMode.buttons) {
                    this.window = Playbacks.controls.buttonsWindow = Playbacks.controls.buttonsWindow || new window.uiTypes.ButtonsWindow(this.$page, this.m_commandLine);
                } /*else if (mode == PlaybacksViewMode.main) {
                    this.window = Playbacks.controls.mainWindow = Playbacks.controls.mainWindow || new window.uiTypes.MainWindow(this.$page, this.m_commandLine);
                }*/
            }
            if (!this.window) {
                error("Playbacks.initWindow: invalid argument 'mode'");
                return false;
            }

            this.window.setModel(null);
            this.$window = $(this.window);

            if (!this.__pageSizeChanged_context) {
                this.__pageSizeChanged_context = this.__pageSizeChanged.bind(this);
                this.$window.on(uiTypes.BaseWindow.events.onPageSizeChanged, this.__pageSizeChanged_context);
            }

            this.window.setParent(this.$page);
            this.window.init();
            this.__pageInitialized = false;

            return true;
        };

        Playbacks.prototype.disposeWindow = function () {
            if (this.__pageSizeChanged_context) {
                this.$window.off(uiTypes.BaseWindow.events.onPageSizeChanged, this.__pageSizeChanged_context);
                this.__pageSizeChanged_context = null;
            }

            if (this.window) {
                this.window.dispose();
            }
        };

        Playbacks.prototype.__sliderMoved = function (event, data) {

            this.m_commandExecutor.send({
                requestType: Server.requestTypes.playbacks_userInput,
                "execIndex": data.execIndex,
                "pageIndex": this.pagesNavigationBar.getPagesData().index,
                "faderValue": data.value,
                "type": 1
            });

            log("Slider " + data.execIndex + " was moved. Value: " + data.value);
        };

        Playbacks.prototype.__buttonPressed = function (event, data) {

            this.m_commandExecutor.send({
                requestType: Server.requestTypes.playbacks_userInput,
                "cmdline": this.m_commandLine.getText(),
                "execIndex": data.execIndex,
                "pageIndex": this.pagesNavigationBar.getPagesData().index,
                "buttonId": data.buttonId,
                "pressed": data.pressed || false,
                "released": data.released|| false,
                "type": 0
            });

            log("Button " + data.buttonId + "." + data.execIndex + " pressed");
        };

        Playbacks.prototype.__pageSizeChanged = function (event, data) {
            if(isDot2())
            {
                var tmp = data.pageSize;
                data.pageSize = [];
                var itemTypeGroups = this.pagesNavigationBar.getMode().itemsType.length;
                for(var i = 0; i < itemTypeGroups; i++)
                {
                    data.pageSize.push(tmp);
                }
            }
            this.pagesNavigationBar.getMode().itemsStep = data.pageSize;
            this.pagesNavigationBar.setParameters(this.pageNavigationModel, !this.__pageInitialized);

            if (this.model && this.window) {
                this.window.setModel(this.model);
            }
        };

        Playbacks.prototype.__requestData = function () {
            this.m_commandExecutor.send(this.getPayloadObject());
        };

        Playbacks.prototype.__dataResponseReady = function (data) {
            if (!data || (data.responseType != Server.requestTypes.playbacks)) {
                return false;
            }

            if (this.window) {
                this.accessDenied = data.accessDenied;
                var currentMode = this.pagesNavigationBar.getMode();
                if (data.accessDenied /*|| (data.itemsType != currentMode.v)*/) {
                    // response data does not correspond to current mode. or user rights are insufficient. Ignore it
                    return false;
                }

                if(currentMode.v == data.responseSubType)
                {
                    this.window.setModel(data);
                    if(data.itemGroups)
                    {
                        for(var i = 0; i < data.itemGroups.length; i++)
                        {
                            data.itemGroups[i].iExecOff = data.itemGroups[i].iExecOff || 0;
                            data.itemGroups[i].cntPages = data.itemGroups[i].cntPages || 0;

                            var updateNavigationModel = currentMode.itemsIndexOffset[i] != data.itemGroups[i].iExecOff;
                            currentMode.itemsIndexOffset[i] = data.itemGroups[i].iExecOff;

                            updateNavigationModel |= currentMode.pagesCount != data.itemGroups[i].cntPages;
                            currentMode.pagesCount = data.itemGroups[i].cntPages;

                            if (updateNavigationModel || !this.__pageInitialized) {
                                this.pagesNavigationBar.setParameters(this.pageNavigationModel, !this.__pageInitialized);
                            }
                        }
                    }
                    this.__pageInitialized = true;
                }

            }
            return true;
        };

        Playbacks.prototype.getPayloadObject = function () {
            var payload = {};
            payload.requestType = Server.requestTypes.playbacks;
            var itemsData = this.pagesNavigationBar.getItemsData();
            payload.startIndex = itemsData.index;
            payload.itemsCount = itemsData.count;
            var pagesData = this.pagesNavigationBar.getPagesData();
            payload.pageIndex = pagesData.index;
            payload.itemsType = this.pagesNavigationBar.getMode().itemsType;
            payload.view = this.pagesNavigationBar.getMode().v;
            payload.execButtonViewMode = this.window ? this.window.constructor.execButtonViewMode : PlaybackExecButtonViewMode.short;
            payload.buttonsViewMode = PlaybackButtonsViewMode.simple;
            return payload;
        };

        Playbacks.prototype.Show = function () {
            Playbacks.superclass.Show.call(this);

            if (!this.__requestData_context) {
                this.__requestData_context = this.__requestData.bind(this);
                GlobalTimers.AddRequestTimerEventHandler(this.__requestData_context);
            }

            if (!this.__refresh_context) {
                this.__refresh_context = this.refresh.bind(this);
                GlobalTimers.AddRefreshTimerEventHandler(this.__refresh_context);
            }
        };

        Playbacks.prototype.refresh = function () {
            if (this.pagesNavigationBar) {
                this.pagesNavigationBar.refresh();

                this.initWindow(this.pagesNavigationBar.getMode().v, this.accessDenied);

                if (this.window) {
                    this.window.refresh();
                }
            }
        };

        Playbacks.prototype.Close = function () {
            Playbacks.superclass.Close.call(this);

            if (this.__requestData_context) {
                GlobalTimers.RemoveRequestTimerEventHandler(this.__requestData_context);
                this.__requestData_context = null;
            }
            if (this.__dataResponseReady_context) {
                DataHandlerManager.Unregister(this.id + "DataHandler");
                this.__dataResponseReady_context = null;
            }

            if (this.__sliderMoved_context) {
                PlaybacksDispatcher.unregister({ type: actions.SLIDER_ACTION, handler: this.__sliderMoved_context });
                this.__sliderMoved_context = null;
            }

            if (this.__buttonPressed_context) {
                PlaybacksDispatcher.unregister({ type: actions.EXEC_BUTTON_ACTION, handler: this.__buttonPressed_context });
                this.__buttonPressed_context = null;
            }

            if (this.__refresh_context) {
                GlobalTimers.RemoveRefreshTimerEventHandler(this.__refresh_context);
                this.__refresh_context = null;
            }

            this.disposeWindow();

            this.pagesNavigationBar.deactivate();
        };

        ns.Playbacks = Playbacks;
    })(window.uiTypes.pages);

    (function (ns) {
        var GlobalTimers = window.timers.GlobalTimers;
        var math = utilities.math;

        var faderUpdateInterval = 10; // ms

        // #region BaseWindow

        var BaseWindow = function (parent, commandLine) {
            this.parent = parent;
            this.m_commandLine = commandLine;

            this.m_defaultSettings = {

            };

            this.$this = $(this);
        };
        BaseWindow.events = {
            onPageSizeChanged: "onPageSizeChanged"
        };

        BaseWindow.prototype.init = function () {
            if (!this.onResize_context) {
                this.onResize_context = this.onResize ? this.onResize.bind(this) : Function.constructor;
                generic.globs.$window.on('resize', this.onResize_context);
            }
        };
        BaseWindow.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        BaseWindow.prototype.setModel = function (model) {
            this.model = model;
        };
        BaseWindow.prototype.onResize = Function.constructor;
        BaseWindow.prototype.dispose = function () {
            generic.globs.$window.off('resize', this.onResize_context);
            this.onResize_context = null;
        };

        // #endregion

        // #region Common Components
        var ButtonComponent = React.createClass({
            getInitialState: function() {
                this.itemData = {};
                return {data: this.props.data};
            },
            initialized: false,
            shouldComponentUpdate: function(nextProps, nextState) {
                if (!this.initialized) {
                    this.initialized = true;
                    return true;
                }

                var shouldUpdate = hasChanged(this.props.data, "s", nextProps.data) ||
                    hasChanged(this.props.data, "t", nextProps.data) ||
                    hasChanged(this.props.data, "bdC", nextProps.data) ||
                    hasChanged(this.props.data, "c", nextProps.data);

                return shouldUpdate;
            },
            render: function () {
                var className = "exec-button";
                if (this.props.data.s) {
                    className += " selected";
                }
                if(isDot2())
                {
                    var imagePath = window.getExecImage(this.props.data.t);
                    return <div className={className} ref="item">
                        <div className="content">
                            <img className="execBtnIcon" src={imagePath}/>
                        </div>
                    </div>;
                }
                else
                {
                    return <div className={className} ref="item">
                        <div className="content"> { this.props.data.t } </div>
                    </div>;
                }
            },
            componentDidMount: function() {
                var domNode = React.findDOMNode(this.refs.item);
                domNode.addEventListener(Touch.maTouchDown, this.buttonPressed);
                domNode.addEventListener(Touch.maTouchUp, this.buttonPressed);
            },
            componentWillUnmount: function () {
                var domNode = React.findDOMNode(this.refs.item);
                domNode.removeEventListener(Touch.maTouchDown, this.buttonPressed);
                domNode.removeEventListener(Touch.maTouchUp, this.buttonPressed);
            },
            buttonPressed: function (event) {
                PlaybacksDispatcher.trigger({
                    type: actions.EXEC_BUTTON_ACTION,
                    data: {
                        execIndex: this.props.execIndex,
                        buttonId: this.props.buttonId,
                        pressed: event.type == Touch.maTouchDown,
                        released: event.type == Touch.maTouchUp
                    }
                });
            },
            componentDidUpdate: function() {
                var itemData = this.itemData;
                if(!isDot2())
                {
                    var itemElement = React.findDOMNode(this.refs.item);
                    if (checkAndSet(this.props.data, "bdC", itemData, "borderColor")) {
                        itemElement.style.borderColor = itemData.borderColor;
                    }
                    if (checkAndSet(this.props.data, "c", itemData, "color")) {
                        itemElement.style.color = itemData.color;
                    }
                }
            }
        });

        var Button1Component = React.createClass({
            getInitialState: function() {
                this.itemData = {};
                this.leftLEDData = {};
                this.rightLEDData = {};
                return {data: this.props.data};
            },
            initialized: false,
            shouldComponentUpdate: function(nextProps, nextState) {
                if (!this.initialized) {
                    this.initialized = true;
                    return true;
                }

                var shouldUpdate = hasChanged(this.props.data, "s", nextProps.data) ||
                    hasChanged(this.props.data, "t", nextProps.data) ||
                    hasChanged(this.props.data, "bdC", nextProps.data) ||
                    hasChanged(this.props.data, "c", nextProps.data) ||
                    hasChanged(this.props.data.leftLED, "bC", nextProps.data.leftLED) ||
                    hasChanged(this.props.data.rightLED, "bC", nextProps.data.rightLED);

                return shouldUpdate;
            },
            render: function () {
                var className = "exec-button";
                if (this.props.data.s) {
                    className += " selected";
                }
                if(isDot2())
                {
                    var imagePath = window.getExecImage(this.props.data.t,1);
                    return <div className={className} ref="item">
                        <div className="content">
                            <img className="execBtnIcon" src={imagePath}/>
                        </div>
                    </div>;
                }
                else
                {
                    return <div className={className} ref="item">
                        <div className="indicator left" ref="leftLED"></div>
                        <div className="indicator right" ref="rightLED"></div>
                        <div className="content"> { this.props.data.t } </div>
                    </div>;
                }
            },
            componentDidMount: function() {
                var domNode = React.findDOMNode(this.refs.item);
                domNode.addEventListener(Touch.maTouchDown, this.buttonPressed);
                domNode.addEventListener(Touch.maTouchUp, this.buttonPressed);
            },
            componentWillUnmount: function () {
                var domNode = React.findDOMNode(this.refs.item);
                domNode.removeEventListener(Touch.maTouchDown, this.buttonPressed);
                domNode.removeEventListener(Touch.maTouchUp, this.buttonPressed);
            },
            buttonPressed: function (event) {
                PlaybacksDispatcher.trigger({
                    type: actions.EXEC_BUTTON_ACTION,
                    data: {
                        execIndex: this.props.execIndex,
                        buttonId: this.props.buttonId,
                        pressed: event.type == Touch.maTouchDown,
                        released: event.type == Touch.maTouchUp
                    }
                });
            },
            componentDidUpdate: function() {
                var itemData = this.itemData;
                var leftLEDData = this.leftLEDData;
                var rightLEDData = this.rightLEDData;
                if(isDot2())
                {
                    var itemElement = React.findDOMNode(this.refs.item);
                    if (checkAndSet(this.props.data, "c", itemData, "color")) {
                        if(itemData.color == "#FFFF00")
                        {
                            itemElement.style.backgroundColor = "#808080";
                        }
                    }
                }
                else
                {
                    var itemElement = React.findDOMNode(this.refs.item);
                    if (checkAndSet(this.props.data, "bdC", itemData, "borderColor")) {
                        itemElement.style.borderColor = itemData.borderColor;
                    }
                    if (checkAndSet(this.props.data, "c", itemData, "color")) {
                        itemElement.style.color = itemData.color;
                    }

                    var leftLEDElement = React.findDOMNode(this.refs.leftLED);
                    if (checkAndSet(this.props.data.leftLED, "bC", leftLEDData, "backgroundColor")) {
                        leftLEDElement.style.backgroundColor = leftLEDData.backgroundColor;
                    }
                    var rightLEDElement = React.findDOMNode(this.refs.rightLED);
                    if (checkAndSet(this.props.data.rightLED, "bC", rightLEDData, "backgroundColor")) {
                        rightLEDElement.style.backgroundColor = rightLEDData.backgroundColor;
                    }
                }
            }
        });

        var CueComponent = React.createClass({
            getInitialState: function() {
                this.cueData = {};
                this.progressData = {};
                return {data: this.props.data};
            },
            initialized: false,
            shouldComponentUpdate: function(nextProps, nextState) {
                if (!this.initialized) {
                    this.initialized = true;
                    return true;
                }

                if (!this.props.data && !nextProps.data) {
                    return false;
                }

                if (!this.props.data || !nextProps.data) {
                    return true;
                }

                var shouldUpdate = hasChanged(this.props.data, "t", nextProps.data) ||
                    hasChanged(this.props.data, "c", nextProps.data) ||
                    hasChanged(this.props.data, "bC", nextProps.data) ||
                    hasChanged(this.props.data.pgs, "inv", nextProps.data.pgs) ||
                    hasChanged(this.props.data.pgs, "v", nextProps.data.pgs) ||
                    hasChanged(this.props.data.pgs, "bC", nextProps.data.pgs);

                return shouldUpdate;
            },
            render: function () {
                var cueText = "";
                if(isDot2())
                {
                    cueText = this.props.data.t ? this.props.data.t : "";
                    /*if(cueText == "" && this.props.data.cues.items[0].t)
                    {
                        cueText = this.props.data.cues.items[0].t;
                    }*/
                    if(cueText.search("%") != -1)
                    {
                        cueText = "";
                    }
                    else
                    {
                        cueText = cueText.trim();
                        /*var pos = cueText.search(" ");
                        if(pos >= 0 && cueText.search("BPM") == -1)
                        {
                            cueText = cueText.substring(0,pos);
                        }*/
                    }
                }
                else
                {
                    cueText = this.props.data ? this.props.data.t : "";
                }

                if(isDot2())
                {
                    return <div className="cue" ref="cue">
                        <div className="content">{cueText}</div>
                        <div className="progress-bar" ref="progress"></div>
                    </div>
                }
                else
                {
                    return <div className="cue" ref="cue">
                        <div className="progress-bar" ref="progress"></div>
                        <div className="content">{cueText}</div>
                    </div>
                }
            },
            componentDidUpdate: function() {
                if (!this.props.data) {
                    this.cueData = {};
                    this.progressData = {};
                }

                var cueData = this.cueData;
                var progressData = this.progressData;
                var data = this.props.data || {};

                var cueElement = React.findDOMNode(this.refs.cue);
                if (checkAndSet(data, "c", cueData, "color")) {
                    cueElement.style.color = cueData.color;
                }
                if (checkAndSet(data, "bC", cueData, "backgroundColor") && !isDot2()) {
                    cueElement.style.backgroundColor = cueData.backgroundColor;
                }

                data.pgs = data.pgs || {};
                var progressElement = React.findDOMNode(this.refs.progress);
                if (checkAndSet(data.pgs, "inv", progressData, "inverted", false)) {
                    // TODO: make better
                    $(progressElement).toggleClass("progress-bar-inverted", progressData.inverted);
                }
                if (checkAndSet(data.pgs, "v", progressData, "value", 0)) {
                    progressElement.style.width = (progressData.inverted ? (1 - progressData.value) : progressData.value) * 100 + "%";
                }
                if (checkAndSet(data.pgs, "bC", progressData, "backgroundColor")) {
                    progressElement.style.backgroundColor = progressData.backgroundColor;
                }
            }
        });

        var BottomButtonComponent = React.createClass({
            getInitialState: function() {
                this.progressData = {};
                return {data: this.props.data};
            },
            initialized: false,
            shouldComponentUpdate: function(nextProps, nextState) {
                if (!this.initialized) {
                    this.initialized = true;
                    return true;
                }

                return true;
            },
            render: function () {
                var name = (this.props.data && this.props.data.n && this.props.data.n.t) ? this.props.data.n.t : "";
                if(isDot2())
                {
                    var path = window.getExecImage(name,1);
                    return <div className="content" rel="content">
                            <img className="execBtnIcon" src={path} />
                        </div>;
                }
                else
                {
                    var faderComponent = this.props.data.fader ? <div className="playbacks_executor-button_bottom-button_fader" ref="fader"></div> : {};
                    return <div className="playbacks_executor-button_bottom-button" ref="bottomButton">
                        {faderComponent}
                        <div className="playbacks_executor-button_bottom-button_content">{ name }</div>
                    </div>;
                }
            },
            componentDidUpdate: function() {
                if (this.refs.fader) {
                    var progressData = this.progressData;

                    var faderElement = React.findDOMNode(this.refs.fader);
                    if (checkAndSet(this.props.data.fader, "v", progressData, "value", 0)) {
                        faderElement.style.height = progressData.value * 100 + "%";
                    }
                    if (checkAndSet(this.props.data.fader, "bC", progressData, "backgroundColor")) {
                        faderElement.style.backgroundColor = progressData.backgroundColor;
                    }
                }
            }
        });

        var ExecutorButtonComponent = React.createClass({
            getInitialState: function() {
                this.itemData = {};
                var result = {data: this.props.data} || {};
                result.bdC = "#3D3D3D";
                return result;
            },
            emptyCuesComponentPart: <div className="playbacks_executor-button_cues__empty" />,
            emptyBottomButtonsComponentPart: function() {
                if(isDot2())
                {
                    var path = window.getExecImage("Empty",1);
                    return <div className="content" rel="content">
                        <img className="execBtnIcon" src={path} />
                        </div>;
                }
                else
                {
                    return <div className="playbacks_executor-button_bottom-buttons__empty" />;
                }
            },
            render: function () {
                var cues = [];
                if (this.props.data.cues && this.props.data.cues.items && this.props.data.cues.items.length) {
                    if(isDot2())
                    {
                        if(this.props.data.cues.items.length > 1)
                        {
                            cues.push(<CueComponent key={0} data={this.props.data.cues.items[1]}/>);
                        }
                        else if(this.props.data.cues.items.length > 0)
                        {
                            cues.push(<CueComponent key={0} data={this.props.data.cues.items[0]}/>);
                        }
                    }
                    else
                    {
                        for (var i = 0; i < this.props.data.cues.items.length; i++) {
                            cues.push(<CueComponent key={i} data={this.props.data.cues.items[i]}/>);
                        }
                    }
                } else {
                    // default view
                    cues = this.emptyCuesComponentPart;
                }

                var executorButtonClass = "playbacks_executor-button";
                var bottomButtonsComponent = null;
                if (this.props.execButtonViewMode == PlaybackExecButtonViewMode.extended) {
                    if(isDot2())
                    {
                        executorButtonClass += " bWing";
                    }
                    var bottomButtons = [];
                    if (this.props.data.bottomButtons && this.props.data.bottomButtons.items) {
                        for (var i = 0; i < this.props.data.bottomButtons.items.length; i++) {
                            if (this.props.data.bottomButtons.items[i]) {
                                bottomButtons.push(<BottomButtonComponent key={i} data={this.props.data.bottomButtons.items[i]}/>);
                            }
                        }
                    }
                    bottomButtonsComponent = <div className="playbacks_executor-button_bottom-buttons" ref="bottomButtons">{bottomButtons.length ? bottomButtons : this.emptyBottomButtonsComponentPart()}</div>;
                } else {
                    bottomButtonsComponent = {};
                    executorButtonClass += " playbacks_executor-button__short";
                }

                if(isDot2())
                {
                    var value = this.props.data.tt.t;
                    if(value == "Sequ")
                    {
                        value = "Exec";
                    }
                    var prio = this.props.data.oType.t;
                    if(prio == "!T")
                    {
                        value = "! "+value;
                    }

                    if (this.props.execButtonViewMode == PlaybackExecButtonViewMode.extended)
                    {
                        return <div className={ executorButtonClass } ref="executorButton">
                            <div className="labelContainer" ref="labelContainer">
                                    <div className="label">{value}</div>
                                    <div className="value">{cues}</div>
                            </div>
                            {bottomButtonsComponent}
                        </div>;
                    }
                    else
                    {
                        return <div className={ executorButtonClass } ref="executorButton">
                            <div className="labelContainer" ref="labelContainer">
                                <div className="label">{value}</div>
                                <div className="value">{cues}</div>
                            </div>
                            {bottomButtonsComponent}
                        </div>;
                    }
                }
                else
                {
                    return <div className={ executorButtonClass } ref="executorButton">
                        <div className="top" ref="top">
                            <div className="status">
                                <div className="status-index" ref="statusIndex">
                                    <div className="content">{this.props.data.i.t}</div>
                                </div>
                                <div className="object-type" ref="objectType">
                                    <div className="content"><img className="special-symbols" ref="specialSymbols"/>{this.props.data.oType.t}</div>
                                </div>
                                <div className="object-index"  ref="objectIndex">
                                    <div className="content">{this.props.data.oI.t}</div>
                                </div>
                            </div>
                            <div className="title" ref="title">
                                <div className="content">{this.props.data.tt.t}</div>
                            </div>
                        </div>
                        <div className="cues" ref="cues">{cues}</div>
                        {bottomButtonsComponent}
                    </div>;
                }
            },
            componentDidUpdate: function() {
                var itemData = this.itemData;
                if(isDot2())
                {
                    var labelContainer = React.findDOMNode(this.refs.labelContainer);
                    if (checkAndSet(this.props.data, "bdC", itemData, "borderColor")) {

                        if(itemData.borderColor == "#FFFF80")
                        {
                            if(this.props.data.isRun)
                            {
                                itemData.borderColor = "#707039";
                            }
                            else
                            {
                                itemData.borderColor = "#38381C";
                            }
                        }
                        else if(itemData.borderColor == "#C0C0C0")
                        {
                            if(this.props.data.isRun)
                            {
                                itemData.borderColor = "#567701";
                            }
                            else
                            {
                                itemData.borderColor = "#2B3B00";
                            }
                        }
                        else if(itemData.borderColor == "#E8A901")
                        {
                            if(this.props.data.isRun)
                            {
                                itemData.borderColor = "#775601";
                            }
                            else
                            {
                                itemData.borderColor = "#3B2B00";
                            }
                        }
                        else if(itemData.borderColor == "#80FFFF")
                        {
                            if(this.props.data.isRun)
                            {
                                itemData.borderColor = "#417F7F";
                            }
                            else
                            {
                                itemData.borderColor = "#203F3F";
                            }
                        }
                        labelContainer.style.backgroundColor = itemData.borderColor;
                    }
                }
                else
                {
                    var topElement = React.findDOMNode(this.refs.top);
                    if (checkAndSet(this.props.data, "bC", itemData, "topBackgroundColor")) {
                        topElement.style.backgroundColor = itemData.topBackgroundColor;
                    }

                    var executorButton = React.findDOMNode(this.refs.executorButton);
                    if (checkAndSet(this.props.data, "bdC", itemData, "borderColor")) {
                        executorButton.style.borderColor = itemData.borderColor;
                    }

                    var statusIndexElement = React.findDOMNode(this.refs.statusIndex);
                    if (checkAndSet(this.props.data.i, "c", itemData, "statusIndexColor")) {
                        statusIndexElement.style.color = itemData.statusIndexColor;
                    }

                    var objectTypeElement = React.findDOMNode(this.refs.objectType);
                    if (checkAndSet(this.props.data.oType, "c", itemData, "objectTypeColor")) {
                        objectTypeElement.style.color = itemData.objectTypeColor;
                    }

                    var objectIndexElement = React.findDOMNode(this.refs.objectIndex);
                    if (checkAndSet(this.props.data.oI, "c", itemData, "objectIndexColor")) {
                        objectIndexElement.style.color = itemData.objectIndexColor;
                    }

                    var titleElement = React.findDOMNode(this.refs.title);
                    if (checkAndSet(this.props.data.tt, "c", itemData, "titleColor")) {
                        titleElement.style.color = itemData.titleColor;
                    }

                    var cuesElement = React.findDOMNode(this.refs.cues);
                    if (checkAndSet(this.props.data.cues, "bC", itemData, "cuesBackgroundColor")) {
                        cuesElement.style.backgroundColor = itemData.cuesBackgroundColor;
                    }

                    var specialSymbolsElement = React.findDOMNode(this.refs.specialSymbols);
                    if (checkAndSet(this.props.data, "specialSymbols", itemData, "specialSymbols")) {
                        if (this.props.data.specialSymbols) {
                            specialSymbolsElement.setAttribute("src", "./images/" + this.props.data.specialSymbols + ".png");
                            specialSymbolsElement.style.display = "";
                        } else {
                            specialSymbolsElement.style.display = "none";
                        }
                    }
                }

            },
            componentDidMount: function() {
                var executorButton = React.findDOMNode(this.refs.executorButton);
                if (this.props.viewMode == PlaybacksViewMode.buttons) {
                    executorButton.addEventListener(Touch.maTouchDown, this.buttonPressed);
                    executorButton.addEventListener(Touch.maTouchUp, this.buttonPressed);
                }
            },
            componentWillUnmount: function () {
                var executorButton = React.findDOMNode(this.refs.executorButton);
                if (this.props.viewMode == PlaybacksViewMode.buttons) {
                    executorButton.removeEventListener(Touch.maTouchDown, this.buttonPressed);
                    executorButton.removeEventListener(Touch.maTouchUp, this.buttonPressed);
                }
            },
            buttonPressed: function (event) {
                var trigger = (this.props.viewMode == PlaybacksViewMode.buttons) || !this.props.commandLine.isEmpty();
                if (trigger) {
                    PlaybacksDispatcher.trigger({
                        type: actions.EXEC_BUTTON_ACTION,
                        data: {
                            execIndex: this.props.execIndex,
                            buttonId: this.props.buttonId,
                            pressed: event.type == Touch.maTouchDown,
                            released: event.type == Touch.maTouchUp
                        }
                    });
                }
            },
        });

        var FaderComponent = React.createClass({
            getInitialState: function() {
                this.sliderData = {};
                this.itemData = {};
                return {data: this.props.data};
            },
            render: function () {
                if(isDot2())
                {
                    return <div className="fader" ref="item">
                        <div className="axe-wrapper">
                            <div className="axe">
                                <div className="filler" ref="filler"></div>
                            </div>
                            <div className="slider" ref="slider" data-value={this.props.data.v} data-min-value={this.props.data.min} data-max-value={this.props.data.max}>
                                <div className="content">{ this.props.data.vT }</div>
                            </div>
                        </div>
                    </div>;
                }
                else
                {
                    return <div className="fader" ref="item">
                        <div className="axe-wrapper">
                            <div className="axe"></div>
                            <div className="slider" ref="slider" data-value={this.props.data.v} data-min-value={this.props.data.min} data-max-value={this.props.data.max}>
                                <div className="slider-title">
                                    <div className="content">{ this.props.data.tt }</div>
                                </div>
                                <div className="slider-middle-line">
                                    <div className="content">{ this.props.data.vT }</div>
                                </div>
                            </div>
                        </div>
                    </div>;
                }
            },
            captured: false,
            fullHeight: 0,
            onSliderDown: function (event) {
                this.captured = true;
                this.fullHeight = $(this.refs.slider.getDOMNode()).parent().height();
                this.capturedPoint = { x: event.pageX, y: event.pageY };
                this.sliderStartValue = this.sliderData.valueInPercents;
            },
            onSliderMove: function (event) {
                if (this.captured) {
                    var offsetY = this.capturedPoint.y - event.pageY;
                    var offsetPercents = offsetY / this.fullHeight * 100 + parseFloat(this.sliderStartValue);
                    var offsetPercentsNormalized = Math.min(100, Math.max(0, offsetPercents));

                    var actualValue = (this.props.data.max - this.props.data.min) * offsetPercentsNormalized / 100 + this.props.data.min;

                    PlaybacksDispatcher.trigger({
                        type: actions.SLIDER_ACTION,
                        data: {
                            execIndex: this.props.execIndex,
                            value: actualValue,
                        }
                    });
                }
            },
            onSliderUp: function (event) {
                if (this.captured) {
                    this.captured = false;
                    this.capturedPoint = null;
                }
            },
            componentDidMount: function() {
                var domNode = React.findDOMNode(this.refs.slider);
                domNode.addEventListener(Touch.maTouchDown, this.onSliderDown);
                domNode.addEventListener(Touch.maTouchUp, this.onSliderUp);

                this.onSliderMove_throttled = _.throttle(this.onSliderMove, faderUpdateInterval);
                domNode.addEventListener(Touch.maTouchMove, this.onSliderMove_throttled);
            },
            componentWillUnmount: function () {
                var domNode = React.findDOMNode(this.refs.slider);
                domNode.removeEventListener(Touch.maTouchDown, this.onSliderDown);
                domNode.removeEventListener(Touch.maTouchUp, this.onSliderUp);
                domNode.removeEventListener(Touch.maTouchMove, this.onSliderMove_throttled);
            },
            componentDidUpdate: function() {
                var sliderData = this.sliderData;

                var slider = $(this.refs.slider.getDOMNode());
                if(isDot2())
                {
                    var filler = $(this.refs.filler.getDOMNode());
                }
                var valueRange = this.props.data.max - this.props.data.min;
                var value = this.props.data.v || 0;
                var valueInPercents = valueRange ? (value * 100 / valueRange).toFixed(1) : 0;

                if (checkAndSet({valueInPercents: valueInPercents}, "valueInPercents", sliderData, "valueInPercents", 0)) {
                    slider.css("bottom", sliderData.valueInPercents + "%");
                    if(filler)
                    {
                        filler.css("height", sliderData.valueInPercents + "%");
                    }
                }

                var itemData = this.itemData;
                if(!isDot2())
                {
                    var itemElement = React.findDOMNode(this.refs.item);
                    if (checkAndSet(this.props.data, "bdC", itemData, "borderColor")) {
                        itemElement.style.borderColor = itemData.borderColor;
                    }
                }
            }
        });

        var ExecutorBlockComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            render: function () {
                if (!this.props.data) {
                    return <div className="executor-block"></div>;
                }

                var content = {};
                if (this.props.viewMode == PlaybacksViewMode.faders) {
                    if(isDot2())
                    {
                        return <div className="executor-block">
                                <FaderComponent data={this.props.data.fader} execIndex={this.props.data.iExec}/>
                                <Button1Component data={this.props.data.button1} execIndex={this.props.data.iExec} buttonId={0}/>
                                <ButtonComponent data={this.props.data.button2} execIndex={this.props.data.iExec} buttonId={1}/>
                            </div>;
                    }
                    else
                    {
                        return <div className="executor-block">
                                <ButtonComponent data={this.props.data.button3} execIndex={this.props.data.iExec} buttonId={2}/>
                                <ButtonComponent data={this.props.data.button2} execIndex={this.props.data.iExec} buttonId={1}/>
                                <FaderComponent data={this.props.data.fader} execIndex={this.props.data.iExec}/>
                                <Button1Component data={this.props.data.button1} execIndex={this.props.data.iExec} buttonId={0}/>
                            </div>;
                    }
                } else if (this.props.viewMode == PlaybacksViewMode.buttons) {
                    return <div className="executor-block">
                            <Button1Component data={this.props.data.button1} execIndex={this.props.data.iExec} buttonId={0}/>
                        </div>;
                }
                return <div className="executor-block">{content}</div>;
            }
        });

        var SectionComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            render: function () {
                var execIndex = this.props.data.iExec;

                var content = [ <ExecutorButtonComponent data={this.props.data} viewMode={this.props.viewMode} execButtonViewMode={this.props.execButtonViewMode} execIndex={execIndex} buttonId={0} commandLine={this.props.commandLine}/> ];
                var executorBlocks = [];
                if (this.props.data.executorBlocks) {
                    for (var i = 0; i < this.props.data.combinedItems; i++) {
                        var execBlock = this.props.data.executorBlocks ? this.props.data.executorBlocks[i] : null;
                        execBlock.iExec = execIndex + i;
                        executorBlocks.push(<ExecutorBlockComponent key={i} data={execBlock} viewMode={this.props.viewMode}/>);
                    }
                    content.push(<div className="executor-blocks">{executorBlocks}</div>);
                }

                return <div className="playbacks_item-block_section" data-colspan={this.props.data.combinedItems || 1} >{content}</div>;
            }
        });

        var BlockComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            render: function () {
                var sections = [];
                if (this.props.data) {
                    for (var i = 0; i < this.props.data.length; i++) {
                        var section = this.props.data[i];
                        if(isDot2())
                        {
                            sections.unshift(<SectionComponent key={i} data={section} viewMode={this.props.viewMode} execButtonViewMode={this.props.execButtonViewMode} commandLine={this.props.commandLine}/>);
                        }
                        else
                        {
                            sections.push(<SectionComponent key={i} data={section} viewMode={this.props.viewMode} execButtonViewMode={this.props.execButtonViewMode} commandLine={this.props.commandLine}/>);
                        }
                    }
                }
                return <div className="playbacks_item-block" ref="itemBlock">{sections}</div>;
            }
        });

        var FWingComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            render: function () {

                return <div className="playbackWindowWrapper">
                    <ButtonsPageComponent data={this.state.data} execButtonViewMode="2" commandLine={this.state.commandLine} />
                    <FadersPageComponent data={this.state.data}  execButtonViewMode={this.state.execButtonViewMode} commandLine={this.state.commandLine} />
                </div>;

            }
        });

        var FadersPageComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            componentDidUpdate: function() {
                if(isDot2() && !this.childsWidthSet)
                {
                    var node = this.getDOMNode();
                    if(node && node.childNodes[1])
                    {
                        if(node.childNodes[1].childNodes.length > 0)
                        {
                            var itemBlocks = node.childNodes[1].childNodes;
                            var blockCount = itemBlocks.length;
                            this.childsCount = blockCount;
                            for(var i = 0; i < blockCount; i++)
                            {
                                itemBlocks[i].style.maxWidth = (100/blockCount)+"%";
                            }
                            this.childsWidthSet = true;
                        }
                    }
                }
            },
            render: function () {
                var blocks = [];
                var title = "";
                var data = null;
                if (this.state.data) {
                    data = this.state.data;
                }
                else if (this.props.data) {
                    data = this.props.data;
                }
                if(data) {
                    var title = data ? data.tt: null;
                    var itemGroups = data ? data.itemGroups : null;
                    if (itemGroups) {
                        for(var k = 0; k < itemGroups.length; k++)
                        {
                            if(itemGroups[k] && itemGroups[k].items && itemGroups[k].items.length && itemGroups[k].itemsType == 2)
                            {
                                var items = itemGroups[k].items;
                                if(isDot2() && this.childsWidthSet && this.childsCount != items.length)
                                {
                                    this.childsWidthSet = false;
                                }
                                for (var i = 0; i < items.length; i++) {
                                    var block = items[i];
                                    if(isDot2())
                                    {
                                        blocks.unshift(<BlockComponent key={i} data={block} viewMode={PlaybacksViewMode.faders} execButtonViewMode={this.props.execButtonViewMode} commandLine={this.props.commandLine}/>);
                                    }
                                    else
                                    {
                                        blocks.push(<BlockComponent key={i} data={block} viewMode={PlaybacksViewMode.faders} execButtonViewMode={this.props.execButtonViewMode} commandLine={this.props.commandLine}/>);
                                    }
                                }
                                var firstIndex = items[0] && items[0][0] && items[0][0].i ? items[0][0].i.t : "?";
                                var lastItem1 = items[items.length - 1];
                                var lastItem2 = lastItem1 ? lastItem1[lastItem1.length - 1] : null;
                                var lastIndex = lastItem2 && lastItem2.i ? lastItem2.i.t : firstIndex;
                                if(!isDot2())
                                {
                                    title = "Fader " + data.iPage;
                                    if (data.tt) {
                                        title += " - \"" + data.tt + "\"";
                                    }
                                    title += " (" + firstIndex + "..." + lastIndex + ")";
                                }
                            }
                        }
                    }
                }

                return <div className="playbacks_faders">
                    <PageTitleComponent title={title} />
                    <div className="playbacks_faders-row">{blocks}</div>
                </div>;
            }
        });

        var ButtonsPageComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            componentDidUpdate: function() {
                if(isDot2() && !this.childsWidthSet)
                {
                    var node = this.getDOMNode();
                    if(node && node.childNodes[1])
                    {
                        if(node.childNodes[1].childNodes.length > 0)
                        {
                            var buttonGroups = node.childNodes[1].childNodes;
                            for(var i = 0; i < buttonGroups.length; i++)
                            {
                                var itemBlocks = buttonGroups[i].childNodes;
                                var blockCount = itemBlocks.length;
                                this.childsCount = blockCount;
                                for(var j = 0; j < blockCount; j++)
                                {
                                    itemBlocks[j].style.maxWidth = (100/blockCount)+"%";
                                }
                            }
                            this.childsWidthSet = true;
                        }
                    }
                }
            },
            render: function () {
                var grid = [];
                var title = "";
                var data = null;
                if (this.state.data) {
                    data = this.state.data;
                }
                else if (this.props.data) {
                    data = this.props.data;
                }
                if(data) {
                    var itemGroups = data ? data.itemGroups : null;
                    if (itemGroups) {
                        for(var k = 0; k < itemGroups.length; k++)
                        {
                            if(itemGroups[k] && itemGroups[k].items && itemGroups[k].items.length && itemGroups[k].itemsType == 3)
                            {
                                var items = itemGroups[k].items;
                                var rowSize = (data.layout ? data.layout.rowSize : 0) || 1;

                                if(isDot2())
                                {
                                    if(rowSize > items.length)
                                    {
                                        rowSize = items.length;
                                    }
                                    if(this.childsWidthSet && this.childsCount != items.length)
                                    {
                                        this.childsWidthSet = false;
                                    }
                                }

                                var rowsCount = items.length / rowSize;

                                for (var i = 0; i < rowsCount; i++) {
                                    var rows = [];
                                    for (var j = 0; j < rowSize; j++) {
                                        var index = i * rowSize + j;
                                        if(isDot2())
                                        {
                                            rows.unshift(<BlockComponent key={index} data={items[index]} viewMode={PlaybacksViewMode.buttons} execButtonViewMode={this.props.execButtonViewMode} commandLine={this.props.commandLine}/>);
                                        }
                                        else
                                        {
                                            rows.push(<BlockComponent key={index} data={items[index]} viewMode={PlaybacksViewMode.buttons} execButtonViewMode={this.props.execButtonViewMode} commandLine={this.props.commandLine}/>);
                                        }
                                    }
                                    if(isDot2())
                                    {
                                        grid.push(<div key={"row" + k} className="playbacks_buttons-grid_row">{rows}</div>);
                                    }
                                    else
                                    {
                                        grid.push(<div key={"row" + i} className="playbacks_buttons-grid_row">{rows}</div>);
                                    }
                                }

                                var firstIndex = items[0] && items[0][0] && items[0][0].i ? items[0][0].i.t : "?";
                                var lastItem1 = items[items.length - 1];
                                var lastItem2 = lastItem1 ? lastItem1[lastItem1.length - 1] : null;
                                var lastIndex = lastItem2 && lastItem2.i ? lastItem2.i.t : firstIndex;
                                if(!isDot2())
                                {
                                    title = "Button " + data.iPage + " - ";
                                    if (data.tt) {
                                        title += "\"" + data.tt + "\" ";
                                    }
                                    title += "(" + firstIndex + "..." + lastIndex + ")";
                                }
                            }
                        }
                    }
                }

                return <div className="playbacks_buttons">
                    <PageTitleComponent title={title} />
                    <div className="playbacks_buttons-grid">{grid}</div>
                </div>;
            }
        });

        var MainExecPageComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            render: function () {
                var grid = [];
                var title = "";
                var data = null;
                if (this.state.data) {
                    data = this.state.data;
                }
                else if (this.props.data) {
                    data = this.props.data;
                }
                if(data) {
                    var itemGroups = data ? data.itemGroups : null;
                    if (itemGroups) {
                        for(var k = 0; k < itemGroups.length; k++)
                        {
                            if(itemGroups[k] && itemGroups[k].items && itemGroups[k].items.length && itemGroups[k].itemsType == 1)
                            {
                                var items = itemGroups[k].items;
                                log("Main!");
                            }
                        }
                    }
                }

                return <div className="playbacks_mainExec">
                    <div className="playbacks_mainExec-grid">{grid}</div>
                </div>;
            }
        });

        var CoreComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            render: function () {

                return <div className="playbackWindowWrapperMainExec">
                    <div className="playbackWindowWrapper">
                        <ButtonsPageComponent data={this.state.data} execButtonViewMode="2" commandLine={this.state.commandLine} />
                        <FadersPageComponent data={this.state.data}  execButtonViewMode={this.state.execButtonViewMode} commandLine={this.state.commandLine} />
                    </div>
                    <MainExecPageComponent data={this.state.data}  execButtonViewMode={this.state.execButtonViewMode} commandLine={this.state.commandLine} />
                </div>
                ;

            }
        });

        var PageTitleComponent = React.createClass({
            getInitialState: function() {
                return {title: ""};
            },
            render: function () {
                return <div className="playbacks_page_title__small">{this.props.title}</div>;
            }
        });

        var FallbackPageComponent = React.createClass({
            getInitialState: function() {
                return {data: this.props.data};
            },
            render: function () {
                return <div className="fallback_page playbacks_fallback-page">Insufficient User Rights</div>;
            }
        });


        // #region FadersWindow

        var FadersWindow = function (parent, commandLine) {
            FadersWindow.superclass.constructor.call(this, parent, commandLine);
        };
        window.generic.extend(FadersWindow, BaseWindow);
        if(isDot2())
        {
            FadersWindow.kItemsInBlockCount = 1;
        }
        else
        {
            FadersWindow.kItemsInBlockCount = 5;
        }
        FadersWindow.blockItemWidthRem = 5;
        FadersWindow.execButtonViewMode = PlaybackExecButtonViewMode.short;

        FadersWindow.prototype.init = function () {
            FadersWindow.superclass.init.call(this);

            this.blocksInRow = 8;
            this.blocksPerPage = 0;
            if(isDot2())
            {
                this.pageComponentInstance = React.render(<FWingComponent data={this.model}  execButtonViewMode={FadersWindow.execButtonViewMode} commandLine={this.m_commandLine}/>, this.parent[0]);
            }
            else
            {
                this.pageComponentInstance = React.render(<FadersPageComponent data={this.model}  execButtonViewMode={FadersWindow.execButtonViewMode} commandLine={this.m_commandLine}/>, this.parent[0]);
            }
            this.refreshLayout();
        };

        FadersWindow.prototype.refresh = function () {
            //var Perf = React.addons.Perf;

            //Perf.start();
            if (this.model) {
                this.model.layout = this.model.layout || {};
                this.model.layout.rowSize = this.blocksInRow;
            }
            this.pageComponentInstance.setState({ data: this.model, execButtonViewMode: FadersWindow.execButtonViewMode, commandLine: this.m_commandLine });
            //Perf.stop();

            //var measurements = Perf.getLastMeasurements();
            //Perf.printInclusive(measurements);
            //Perf.printWasted(measurements);
        };

        FadersWindow.prototype.onResize = function () {
            FadersWindow.superclass.onResize.call(this);

            this.refreshLayout();
        };

        FadersWindow.prototype.refreshLayout = function () {
            var blockMinWidth = FadersWindow.kItemsInBlockCount * FadersWindow.blockItemWidthRem * utility.getDefaultFontSize();
            var currentWidth = this.parent.width();
            this.blocksInRow = Math.max(1, Math.floor(currentWidth / blockMinWidth));

            if (this.blocksInRow != this.blocksPerPage) {
                this.blocksPerPage = this.blocksInRow;
                this.$this.triggerHandler(BaseWindow.events.onPageSizeChanged, { pageSize: this.blocksPerPage * FadersWindow.kItemsInBlockCount });
            }
        };

        FadersWindow.prototype.dispose = function () {
            FadersWindow.superclass.dispose.call(this);
            React.unmountComponentAtNode(this.parent[0]);
        };

        // #endregion

        // #region ButtonsWindow

        var ButtonsWindow = function (parent, commandLine) {
            ButtonsWindow.superclass.constructor.call(this, parent, commandLine);
        };
        window.generic.extend(ButtonsWindow, BaseWindow);
        if(isDot2())
        {
            ButtonsWindow.kItemsInBlockCount = 1;
        }
        else
        {
            ButtonsWindow.kItemsInBlockCount = 5;
        }
        ButtonsWindow.blockItemWidthRem = 5;
        ButtonsWindow.blockItemHeightRem = 7;
        ButtonsWindow.execButtonViewMode = PlaybackExecButtonViewMode.extended;

        ButtonsWindow.prototype.init = function () {
            ButtonsWindow.superclass.init.call(this);

            this.blocksPerPage = 0;
            this.blocksInRow = 0;
            this.blocksInColumn = 0;

            if(isDot2())
            {
                this.blocksInColumn = 6;
            }

            this.pageComponentInstance = React.render(<ButtonsPageComponent data={this.model} execButtonViewMode={ButtonsWindow.execButtonViewMode} commandLine={this.m_commandLine} />, this.parent[0]);
            this.refreshLayout();
        };

        ButtonsWindow.prototype.refresh = function () {
            //var Perf = React.addons.Perf;

            //Perf.start();
            if (this.model) {
                this.model.layout = this.model.layout || {};
                this.model.layout.rowSize = this.blocksInRow;
            }
            this.pageComponentInstance.setState({ data: this.model, execButtonViewMode: ButtonsWindow.execButtonViewMode, commandLine: this.m_commandLine });
            //Perf.stop();

            //var measurements = Perf.getLastMeasurements();
            //Perf.printInclusive(measurements);
            //Perf.printWasted(measurements);
        };

        ButtonsWindow.prototype.onResize = function () {
            ButtonsWindow.superclass.onResize.call(this);

            this.refreshLayout();
        };

        ButtonsWindow.prototype.refreshLayout = function () {
            var $title = $(".playbacks_page_title__small", this.parent);
            var blockMinWidth = ButtonsWindow.kItemsInBlockCount * ButtonsWindow.blockItemWidthRem * utility.getDefaultFontSize();
            var currentWidth = this.parent.width();
            this.blocksInRow = Math.max(1, Math.floor(currentWidth / blockMinWidth));

            var blockMinHeight= ButtonsWindow.blockItemHeightRem * utility.getDefaultFontSize();
            var currentHeight= this.parent.height() - $title.height();
            this.blocksInColumn = Math.max(1, Math.floor(currentHeight / blockMinHeight));

            var blocksCount;
            if(isDot2())
            {
                blocksCount = parseInt((this.blocksInRow * this.blocksInColumn)/this.blocksInColumn);
            }
            else
            {
                blocksCount = this.blocksInRow * this.blocksInColumn;
            }
            if (blocksCount != this.blocksPerPage) {
                this.blocksPerPage = blocksCount;
                this.$this.triggerHandler(BaseWindow.events.onPageSizeChanged, { pageSize: this.blocksPerPage * ButtonsWindow.kItemsInBlockCount });
            }
        };

        ButtonsWindow.prototype.dispose = function () {
            ButtonsWindow.superclass.dispose.call(this);
            React.unmountComponentAtNode(this.parent[0]);
        };

        // #endregion

        // #region MainWindow

        var MainWindow = function (parent, commandLine) {
            MainWindow.superclass.constructor.call(this, parent, commandLine);
        };
        window.generic.extend(MainWindow, BaseWindow);

        MainWindow.prototype.init = function () {
            MainWindow.superclass.init.call(this);

            this.pageComponentInstance = React.render(<CoreComponent/>, this.parent[0]);
        };

        MainWindow.prototype.refresh = function () {
            this.pageComponentInstance.setState({});
        };

        MainWindow.prototype.dispose = function () {
            MainWindow.superclass.dispose.call(this);
            React.unmountComponentAtNode(this.parent[0]);
        };

        // #endregion

        // #region FallbackWindow

        var FallbackWindow = function (parent, commandLine) {
            FallbackWindow.superclass.constructor.call(this, parent, commandLine);
        };
        window.generic.extend(FallbackWindow, BaseWindow);

        FallbackWindow.prototype.init = function () {
            FallbackWindow.superclass.init.call(this);

            this.pageComponentInstance = React.render(<FallbackPageComponent/>, this.parent[0]);
        };

        FallbackWindow.prototype.refresh = function () {
            this.pageComponentInstance.setState({});
        };

        FallbackWindow.prototype.dispose = function () {
            FallbackWindow.superclass.dispose.call(this);
            React.unmountComponentAtNode(this.parent[0]);
        };

        // #endregion

        ns.BaseWindow = BaseWindow;
        ns.MainWindow = MainWindow;
        ns.FadersWindow = FadersWindow;
        ns.ButtonsWindow = ButtonsWindow;
        ns.FallbackWindow = FallbackWindow;

    })(window.uiTypes);

    defineNamespace(window.uiTypes, "playbacks");

    window.uiTypes.playbacks.PlaybacksViewMode = PlaybacksViewMode;
    window.uiTypes.playbacks.PlaybackButtonsViewMode = PlaybackButtonsViewMode;
    window.uiTypes.playbacks.PlaybackExecButtonViewMode = PlaybackExecButtonViewMode;

}) ();
