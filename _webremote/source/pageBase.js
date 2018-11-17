defineNamespace(window, "uiTypes.pages");

(function(ns){
    var Page = function (commandLine, commandExecutor, globalSettings, dispatcher) {
        this.onResize_context = null;

        this.id = this.constructor.id;
        this.title = this.constructor.title;
        this.content = this.constructor.content;
        this.$page = $(this.content);
        this.$this = $(this);

        this.m_commandLine = commandLine;
        this.m_commandExecutor = commandExecutor;
        this.m_globalSettings = globalSettings;
        this.m_$globalSettings = $(this.m_globalSettings);
        this.m_dispatcher = dispatcher;

        this.globalSettingsChangeHandler_context = this.globalSettingsChangeHandler.bind(this);
    };
    Page.prototype.Init = function () {
        this.$page.addClass("page");
        this.onResize_context = this.OnResize.bind(this);
        generic.globs.$window.on('resize', this.onResize_context);
        this.m_$globalSettings.on("propertyChanged", this.globalSettingsChangeHandler_context);
    };
    Page.prototype.CreatePageButtons = function() {
        return null;
    };
    Page.prototype.Show = utilities.emptyFunction;

    Page.prototype.OnResize = utilities.emptyFunction;

    Page.prototype.Close = function () {
        this.m_$globalSettings.off("propertyChanged", this.globalSettingsChangeHandler_context);
        generic.globs.$window.off('resize', this.onResize_context);
        this.onResize_context = 0;
        if (this.pageButtons) {
            generic.globs.serverCommandManager.removeCommands(this.id);
            commands.ui.disposeUIElements(this.pageButtons);
        }
        this.$page.remove();
    };

    Page.prototype.globalSettingsChangeHandler = utilities.emptyFunction;
    Page.events = {
        pageButtonsChanged: "pageButtonsChanged",
        optionsPanelChanged: "optionsPanelChanged"
    };

    ns.Page = Page;
})(window.uiTypes.pages);

(function (ns) {
    var GlobalTimers = window.timers.GlobalTimers;

    var CanvasPage = function (container, commandLine, commandExecutor, globalSettings, dispatcher) {
        CanvasPage.superclass.constructor.call(this, commandLine, commandExecutor, globalSettings, dispatcher);

        this.canvas = 0;
        this.canvasContainer = container;
        this.m_ma2window = 0;
        this.RefreshTimerProxy = this.RefreshTimerCallback.bind(this);
    };
    window.generic.extend(CanvasPage, window.uiTypes.pages.Page);
    CanvasPage.prototype.CreateWindow = utilities.emptyFunction;
    CanvasPage.prototype.GetPayloadObject = function () { return new Object(); };
    CanvasPage.prototype.Init = function () {
        CanvasPage.superclass.Init.call(this);

        this.$page.append(this.canvasContainer);
    };
    CanvasPage.prototype.RefreshTimerCallback = function () {
        this.m_commandExecutor.send(this.GetPayloadObject());
    };
    CanvasPage.prototype.Show = function () {
        CanvasPage.superclass.Show.call(this);

        this.canvas = $("canvas", this.canvasContainer);
        this.CreateWindow();

        this.OnResize(true);

        GlobalTimers.AddRefreshTimerEventHandler(this.RefreshTimerProxy);
        if (!this.m_commandExecutor.IsConnected()) {
            $.alert({ message: "Currently not Connected to the console" });
        }
    };
    CanvasPage.prototype.OnResize = function (_init) {
        CanvasPage.superclass.OnResize.call(this);

        this.canvas[0].width = this.canvasContainer.width();
        this.canvas[0].height = this.canvasContainer.height();

        this.m_ma2window.resize({ top: 0, left: 0, width: this.canvas[0].width, height: this.canvas[0].height }, _init);
    };
    CanvasPage.prototype.Close = function () {
        //serverResponseHandler = null;
        DataHandlerManager.Unregister(this.id + "DataHandler");

        GlobalTimers.RemoveRefreshTimerEventHandler(this.RefreshTimerProxy);
        this.m_ma2window.Close();

        CanvasPage.superclass.Close.call(this);
    };
    ns.CanvasPage = CanvasPage;
})(window.uiTypes.pages);

(function(ns){
    var PoolPage = function (container, commandLine, commandExecutor, globalSettings, dispatcher) {
        PoolPage.superclass.constructor.call(this, container, commandLine, commandExecutor, globalSettings, dispatcher);

        this.itemSelected_context = this.ItemSelected ? this.ItemSelected.bind(this) : utilities.emptyFunction;
    };
    PoolPage.id = "pools";
    window.generic.extend(PoolPage, window.uiTypes.pages.CanvasPage);
    PoolPage.prototype.CreateWindow = function () {
        var windowClass = this.GetWindowClass();
        this.m_ma2window = new windowClass(this.canvas, window.CanvasRenderer(this.canvas[0].getContext("2d")), { top: 0, left: 0, width: this.canvas[0].width, height: this.canvas[0].height }, this.m_dispatcher);
        this.m_ma2window.init();
        this.m_ma2window.setConfig(generic.globs.config.layout[this.m_globalSettings.layout][PoolPage.id]);
        $(this.m_ma2window).bind(this.m_ma2window.itemSelectedEvent, this.itemSelected_context);
        DataHandlerManager.Register({ name: this.id + "DataHandler", handler: this.m_ma2window.SetDataSource.bind(this.m_ma2window) });
    };

    PoolPage.prototype.globalSettingsChangeHandler = function(event, args) {
        if (args.name === "layout") {
            if (this.m_ma2window) {
                this.m_ma2window.setConfig(generic.globs.config[args.name][args.newValue][PoolPage.id]);
            }
        }
    };

    PoolPage.prototype.GetPayloadObject = function () {
        var payload = {};
        payload.requestType = Server.requestTypes.pool;
        payload.pool = this.constructor.shortId;
        payload.itemsCount = this.m_ma2window.GetVisibleItemsCount();
        payload.itemsOffset = this.m_ma2window.GetDataOffsetY();
        return payload;
    };

    PoolPage.prototype.Close = function () {
        $(this.m_ma2window).unbind(this.m_ma2window.itemSelectedEvent, this.itemSelected_context);

        PoolPage.superclass.Close.call(this);
    };
    ns.PoolPage = PoolPage;
})(window.uiTypes.pages);
