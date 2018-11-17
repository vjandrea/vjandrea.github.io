window.uiTypes.pages.PageManager = (function () {
    var GlobalTimers = window.timers.GlobalTimers;
    var pages = window.uiTypes.pages;
    var PageBase = pages.Page;

    var PageManager = function(commandLine, commandExecutor, globalSettings) {
        this.allPageClasses = {};
        this.allPageClasses[window.uiTypes.pages.Command1.id] = window.uiTypes.pages.Command1;
        this.allPageClasses[window.uiTypes.pages.Command2.id] = window.uiTypes.pages.Command2;
        this.allPageClasses[window.uiTypes.pages.FixtureSheet.id] = window.uiTypes.pages.FixtureSheet;
        /*this.allPageClasses[window.uiTypes.pages.FixtureLayoutSheet.id] = window.uiTypes.pages.FixtureLayoutSheet;*/
        this.allPageClasses[window.uiTypes.pages.ChannelSheet.id] = window.uiTypes.pages.ChannelSheet;
        this.allPageClasses[window.uiTypes.pages.GroupPool.id] = window.uiTypes.pages.GroupPool;
        this.allPageClasses[window.uiTypes.pages.PresetPool.id] = window.uiTypes.pages.PresetPool;
        this.allPageClasses[window.uiTypes.pages.MacroPool.id] = window.uiTypes.pages.MacroPool;
        this.allPageClasses[window.uiTypes.pages.WorldPool.id] = window.uiTypes.pages.WorldPool;
        this.allPageClasses[window.uiTypes.pages.ExecutorSheet.id] = window.uiTypes.pages.ExecutorSheet;
        this.allPageClasses[window.uiTypes.pages.Playbacks.id] = window.uiTypes.pages.Playbacks;

        this.allPageClasses[window.uiTypes.pages.CommandHistory.id] = window.uiTypes.pages.CommandHistory;
        this.allPageClasses[window.uiTypes.pages.MainMenu.id] = window.uiTypes.pages.MainMenu;
        this.allPageClasses[window.uiTypes.pages.Wheels.id] = window.uiTypes.pages.Wheels;
        this.allPageClasses[window.uiTypes.pages.Settings.id] = window.uiTypes.pages.Settings;
        this.allPageClasses[window.uiTypes.pages.FullCommand.id] = window.uiTypes.pages.FullCommand;

        // this.complexPages = {
        //     fullCommand: {
        //         id: "fullCommand",
        //         title: "Commands",
        //         pages: [
        //             window.uiTypes.pages.Command2.id,
        //             window.uiTypes.pages.Command1.id
        //         ]
        //     }
        // };
        // this.allPageClasses[this.complexPages.fullCommand.id] = this.complexPages.fullCommand;

        var defaultPageList = [
            {
                class: this.allPageClasses[window.uiTypes.pages.Command1.id],
                isDefault: true,
                isDot2: true
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.Command2.id]
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.FixtureSheet.id],
                isDot2: true,
                icon: "images/d2ui_view_as_grid_icon_small.png"
            },
            /*{
                class: this.allPageClasses[window.uiTypes.pages.FixtureLayoutSheet.id],
                isDot2: true,
                icon: "images/d2ui_fixture_view_icon_small.png",
                isNotGma2: true
            },*/
            {
                class: this.allPageClasses[window.uiTypes.pages.ChannelSheet.id]
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.GroupPool.id],
                isDot2: true,
                icon: "images/d2ui_group_view_icon_small.png"
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.PresetPool.id],
                isDot2: true,
                icon: "images/d2ui_preset_view_icon_small.png"
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.MacroPool.id]
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.WorldPool.id]
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.ExecutorSheet.id]/*,
                isDot2: true,
                icon: "images/d2ui_sequence_view_icon_small.png"*/
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.Playbacks.id],
                isDot2: true,
                icon: "images/d2ui_virtual_playback_view_icon_small.png"
            }
        ];

        this.additionalPages = [
            {
                class: this.allPageClasses[window.uiTypes.pages.CommandHistory.id],
                isDot2: true
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.MainMenu.id],
                isDot2: true
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.Wheels.id],
                isDot2: true
            },
            {
                class: this.allPageClasses[window.uiTypes.pages.Settings.id],
                isDot2: true
            }
        ];

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        this.currentPageList = null;

        this.globalSettings = globalSettings;
        this.commandLine = commandLine;
        this.commandExecutor = commandExecutor;
        generic.globs.config.activeLayout = this.getLayout();

        var currentPage = null;
        var currentPageData = {};
        var previousPageId;
        var previousPageData;

        this.chain = [];

        this.pageElements = {
            $main: null,
            $pageContent: null,
            $pageContentInner: null,
            $navigationPanel: null,
            topRightButton: null,
            $topButtonsContainer: null,
            $footer: null
        };

        this.controlsPool = {
            "presetType": null
        };

        this.topRightButtonClickHandler_context = (
            function() {
                this.TogglePage(window.uiTypes.pages.Wheels.id, {modal: true});
            }
        ).bind(this);
        this.globalSettingsChangeHandler_context = (
            function(event, args){
                if (args.name === "layout") {
                    this.setLayout(args.oldValue, args.newValue);
                }
            }
        ).bind(this);
        this.refreshTimerHandler_context = this.refreshTimerHandler.bind(this);
        this.pageButtonsChangedHandler_context = this.pageButtonsChangedHandler.bind(this);
        this.optionsPanelContentChangedHandler_context = this.optionsPanelContentChangedHandler.bind(this);

        this.commonDataHandler = {
            name: "CommonDataHandler",
            handler: this.dataHandler.bind(this)
        };
        this.world = new commands.State();

        this.dispatcher = Dispatcher();
        this.dispatcher.actions = {
            CHANGE_TITLE: "change_title"
        };

        this.Init = function () {
            this.$virtualPageContainer = $.createItem({ class: "virtual-main-content" });

            this.pageElements.$main = $(".main-content");
            this.pageElements.$pageContent = $.Layout.pageContent;
            this.pageElements.$pageContentInner = $(".page-content-inner", this.pageElements.$pageContent);
            this.pageElements.$navigationPanel = $.Layout.navigationPanel;
            this.pageElements.topRightButton = document.getElementsByClassName("top-right-button")[0];
            this.pageElements.topRightButton.addEventListener(Touch.maTouchUp, this.topRightButtonClickHandler_context);
            this.pageElements.$topButtonsContainer = $.Layout.topButtons;
            this.pageElements.$footer = $.Layout.bottomButtons;

            this.pageButtons = [
                { command: commands.Commands.previous(), uiElement: commands.ui.UILabel() },
                { command: commands.Commands.set(), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.Commands.next(), uiElement: commands.ui.UILabel() },
            ];
            this.pageButtons.forEach(commands.ui.initCommandUIElementPair);
            generic.globs.serverCommandManager.addCommands("common", this.pageButtons);

            this.footerButtons = this.pageButtons.map(commands.ui.fetchUIElementItems);
            ui.Layout.Place(this.pageElements.$footer, this.footerButtons);
            for (var i = 0; i < this.footerButtons.length; i++) {
                this.footerButtons[i].$item.attr("data-pos", "fixed");
            }

            $(this.globalSettings).on("propertyChanged", this.globalSettingsChangeHandler_context);

            DataHandlerManager.Register(this.commonDataHandler);
            GlobalTimers.AddRefreshTimerEventHandler(this.refreshTimerHandler_context);
        };

        this.applyPageFilter = function()
        {
            var appType = localStorage.getItem("appType");
            if(appType == "dot2")
            {
                var defaultPageListNew = [];
                for(var i = 0; i < defaultPageList.length; i++)
                {
                    if(defaultPageList[i].isDot2) //Achtung keine Funktion (isDot())!!!
                    {
                        defaultPageListNew.push(defaultPageList[i]);
                    }
                }
                defaultPageList = defaultPageListNew;
            }
            if(appType == "gma2")
            {
                var defaultPageListNew = [];
                for(var i = 0; i < defaultPageList.length; i++)
                {
                    if(!defaultPageList[i].isNotGma2)
                    {
                        defaultPageListNew.push(defaultPageList[i]);
                    }
                }
                defaultPageList = defaultPageListNew;
            }

            var html = document.getElementsByTagName("html")[0];
            if(html)
            {
                html.setAttribute("appType",appType);
            }

            this.phonePageList = defaultPageList.slice();
            this.phonePageList.push({
                class: this.allPageClasses[window.uiTypes.pages.MainMenu.id],
                mainMenu: true,
                ignore: true,
                chainIgnore: true,
                isDot2: true
            });

            this.tabletPageList = defaultPageList.slice();
            // remove Command1 and Command2
            this.tabletPageList.shift();
            if(!isDot2())
            {
                this.tabletPageList.shift();
            }
            // add FullCommand and MainMenu pages
            this.tabletPageList.unshift({
                class: this.allPageClasses[window.uiTypes.pages.FullCommand.id],
                isDefault: true,
                isDot2: true
            });
            this.tabletPageList.push({
                class: this.allPageClasses[window.uiTypes.pages.MainMenu.id],
                mainMenu: true,
                ignore: true,
                chainIgnore: true,
                isDot2: true
            });

            this.setLayout(null, this.getLayout());

            var startPage = this.getDefaultPage();
            this.ShowPage(startPage.class.id);
        }

        this.TogglePage = function (id, data) {
            if ((id === undefined) || ((id == currentPage.id) && (JSON.stringify(data) === JSON.stringify(currentPageData.userDefined)))) {
                this.ShowPage(previousPageId, null, true);
            } else {
                this.ShowPage(id, data, true);
            }
        };

        // data
        // {
        //     modal:,
        //     fullscreen:,
        //     freezeCmdline:
        // }
        this.ShowPage = function (id, data, isToggled) {
            Server.resetBlockedRequests();
            window.poolViewVisible = false;

            if (this.getCurrentPage()) {
                if ((this.getCurrentPage().id === id) && (this.getCurrentPageData().userDefined === data)) {
                    window.generic.statusLogging("Requested page '" + id + "' is already opened");
                    return;
                }
            }

            var nextPage = this.resolvePageId(id);
            if (!nextPage) {
                window.generic.statusLogging("Requested page '" + id + "' does not exist");
                return;
            }

            if (currentPage) {
                var page = this.__findPageById(currentPage.id);
                window.generic.statusLogging("Page '" + page.class.title + "' is closing");
            }
            window.generic.statusLogging("Page '" + nextPage.class.title + "' is opening, id=" + nextPage.class.id);

            var pagesToShow = {
                id: nextPage.class.id,
                title: nextPage.class.title,
                pages: []
            };
            if (nextPage.class.pages) {
                for (var i = 0; i < nextPage.class.pages.length; i++) {
                    var pageClass = this.__getPageClass(nextPage.class.pages[i]);
                    pagesToShow.pages.push(new pageClass.class(this.commandLine, this.commandExecutor, this.globalSettings));
                }
            } else {
                pagesToShow.pages.push(new nextPage.class(this.commandLine, this.commandExecutor, this.globalSettings, this.dispatcher));
            }

            this.setCurrentPage(pagesToShow, data, isToggled);
        };

        this.resolvePageId = function(id){
            var pageClass = this.__findPageById(id);
            if (pageClass) {
                return pageClass;
            }

            // check if there is the page with this id
            pageClass = this.__getPageClass(id);
            if (!pageClass) {
                return null;
            }

            var complex = this.allPageClasses[pageClass.class.id].pages;
            if (complex && (complex.length > 0)) {
                // this is complex page, but it is not accessible from current layout. Let's take first subpage and show it
                pageClass = this.__findPageById(complex[0]);
                if (pageClass) {
                    return pageClass;
                }
            }

            // this is the simple page, which is not accessible from current layout. Let's try to find the valid complex page, which contains this simple one
            for(var i in this.complexPages) {
                var page = this.complexPages[i];
                for (var j = 0; j < page.pages.length; j++) {
                    if( id === page.pages[j]){
                        pageClass = this.__findPageById(page.id);
                        if (pageClass) {
                            return pageClass;
                        }
                    }
                }
            }

            // unknown page. Use default one
            return this.getDefaultPage();
        };

        this.closePreviousPage = function(pageDesc, data){
            this.$virtualPageContainer.append(this.pageElements.$pageContentInner);

            if (pageDesc) {
                var dimmerWheelVisible = false;
                if (pageDesc.pages && (pageDesc.pages.length > 0)) {
                    for (var i = 0; i < pageDesc.pages.length; i++) {
                        var page = pageDesc.pages[i];
                        page.Close();

                        // revert changes of previous page
                        if (page.$page) {
                            page.$page.hide();

                            if (page.requirements) {

                            }
                        }
                    }
                }

                if (data) {
                    if (!data.isToggled) {
                        if (pageDesc.id) {
                            previousPageId = pageDesc.id;
                            previousPageData = data;
                        } else {
                            previousPageId = false;
                            previousPageData = null;
                        }
                    }
                    if (data.userDefined && data.userDefined.fullscreen) {
                        if (data.userDefined.freezeCmdline) {
                            window.generic.globs.$body.removeClass("fixed-cmdLine");
                        }
                    }
                }
                this.setPageButtons();
                $(pageDesc).off(PageBase.events.pageButtonsChanged, this.pageButtonsChangedHandler_context);
                $(pageDesc).off(PageBase.events.optionsPanelChanged, this.optionsPanelContentChangedHandler_context);
            }
        };

        this.openNextPage = function(pageDesc, data){
            if (data) {
                if (data.userDefined && data.userDefined.fullscreen) {
                    if (data.userDefined.freezeCmdline) {
                        window.generic.globs.$body.addClass("fixed-cmdLine");
                    }
                }
            }

            pageDesc = pageDesc.pages[0];

            var requirements = $.extend({}, generic.globs.config.layout[this.getLayout()].genericPage);
            $.extend(requirements, pageDesc.requirements);

            if (requirements.presetTypeBar) {
                this.controlsPool["presetType"] = this.controlsPool["presetType"] || new window.uiTypes.PresetTypesDataControl(this.commandLine, this.commandExecutor, new window.uiTypes.PresetTypesBar($.Layout.leftPanel));
                this.controlsPool["presetType"].activate();
            } else if (this.controlsPool["presetType"]) {
                this.controlsPool["presetType"].deactivate();
            }

            $.Layout.show({ dimmerWheel: true }, requirements.showDimmerWheel);
            $.Layout.show({ bottomButtons: true }, !requirements.noFooter);

            this.pageElements.$main.append(pageDesc.$page);
            this.pageElements.$pageContent.append(this.pageElements.$pageContentInner);

            $(pageDesc).on(PageBase.events.pageButtonsChanged, this.pageButtonsChangedHandler_context);
            $(pageDesc).on(PageBase.events.optionsPanelChanged, this.optionsPanelContentChangedHandler_context);

            pageDesc.Init();
            pageDesc.$page.show();
            pageDesc.Show();
        };

        this.setCurrentPage = function (pageDesc, data, isToggled) {
            $.Layout.setHidden({pageContent:true});
            this.closePreviousPage(currentPage, currentPageData);

            currentPage = pageDesc;
            currentPageData.userDefined = data;
            currentPageData.isToggled = isToggled;

            this.navigation.pageChanged(currentPage, currentPageData);
            this.openNextPage(currentPage, currentPageData);

            $.Layout.setVisible({pageContent:true});
        };

        this.getCurrentPage = function () {
            return currentPage;
        };

        this.getCurrentPageData = function () {
            return currentPageData;
        };
    };

    PageManager.prototype.refreshTimerHandler = function() {
        if (this.world.isDirty()) {
            if (this.navigation.navigationBar) {
                this.world.clean();
                this.navigation.navigationBar.setData({
                    options: {
                        icon: (this.world.getState().value) ? generic.globs.config.icons.world : "",
                        index: this.world.getState().value || ""
                    }
                })
            }
        }
    };

    PageManager.prototype.dataHandler = function(response) {
        if (response.worldIndex !== undefined) {
            this.world.setState({ value : response.worldIndex });
        }
        return false;
    };

    /////////////////////////////////////////////////////////////////////////////////////////
    /// Page event handlers
    /////////////////////////////////////////////////////////////////////////////////////////
    PageManager.prototype.pageButtonsChangedHandler = function(e, data) {
        this.setPageButtons(data.buttons);
    };

    PageManager.prototype.setPageButtons = function(buttons) {
        this.pageElements.$topButtonsContainer.empty();
        $(">:not([data-pos=fixed])", this.pageElements.$footer).remove();

        if (buttons) {
            ui.Layout.Place(this.pageButtonsContainer, buttons.map(commands.ui.fetchUIElementItems), {prepend: true});
        }
    };

    PageManager.prototype.optionsPanelContentChangedHandler = function (e, dataControl) {
        this.setOptionsPanel(dataControl);
    };

    PageManager.prototype.setOptionsPanel = function (dataControl) {
        dataControl.setParent($.Layout.leftPanel);
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    /// End page event handlers
    /////////////////////////////////////////////////////////////////////////////////////////

    PageManager.prototype.getDefaultPage = function () {
        return _.find(this.currentPageList, function findDefaultPage(element, index, array) {
            return element.isDefault;
        });
    };

    PageManager.prototype.__findPageById = function (id){
        var predicate = function(element, index, array){return element.class.id === id;};

        return _.find(this.currentPageList, predicate) || _.find(this.additionalPages, predicate);
    };

    PageManager.prototype.__getPageClass = function(id){
        return { class: _.find(this.allPageClasses, function(element, index, array){
            return element.id === id;
        })};
    };

    PageManager.prototype.getPageChain = function () {
        return this.chain;
    };

    /////////////////////////////////////////////////////////////////////////////////////////
    /// Navigation Interface
    /////////////////////////////////////////////////////////////////////////////////////////
    PageManager.prototype.showPage = function(id, data){
        this.ShowPage(id, data);
    };

    PageManager.prototype.togglePage = function(id, data){
        this.TogglePage(id, data);
    };

    PageManager.prototype.getPages = function(){
        var pages = [];
        var currentPageId = this.getCurrentPage().id;
        this.currentPageList.forEach(function (element, index, array){
            if (!element.ignore) {
                pages.push({
                    id: element.class.id,
                    title: element.class.title,
                    current: element.class.id === currentPageId,
                    icon: element.icon
                });
            }
        }, this);

        return pages;
    };

    PageManager.prototype.getMainPage = function(){
        var result = _.find(this.currentPageList, function findMainMenuPage(element, index, array){
            return element.mainMenu;
        });
        if (result) {
            return {
                id: result.class.id,
                title: result.class.title
            };
        }
    };

    PageManager.prototype.getLayout = function () {
        return this.globalSettings.layout || generic.globs.config.layout.default.id;
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    /// End navigation Interface
    /////////////////////////////////////////////////////////////////////////////////////////

    PageManager.prototype.setLayout = function (oldMode, newMode) {
        window.generic.globs.$body.css({ opacity: 0 });

        if (this.navigation) {
            this.navigation.dispose();
            this.navigation = null;
        }

        switch (newMode) {
            case "phone":
                this.currentPageList = this.phonePageList;
                this.navigation = new PhoneModeNavigation(this, this.pageElements.$navigationPanel, this.dispatcher);

                this.pageButtonsContainer = this.pageElements.$topButtonsContainer;
                break;
            case "tablet":
                this.currentPageList = this.tabletPageList;
                this.navigation = new TabletModeNavigation(this, this.pageElements.$navigationPanel, this.dispatcher);

                this.pageButtonsContainer = this.pageElements.$footer;
                break;
        }

        generic.globs.$body.attr("data-page-layout", generic.globs.config.layout[newMode].dataPageLayout);

        this.chain.length = 0;
        this.currentPageList.forEach(function fillChain(element, index, array) {
            if (!element.chainIgnore) {
                this.chain.push(element.class);
            }
        }, this);

        var currentPage = this.getCurrentPage();
        if (currentPage) {
            this.setPageButtons(currentPage.pages[0].CreatePageButtons());
            this.navigation.show(currentPage, this.getCurrentPageData());
        }
        window.generic.globs.$body.animate({ opacity: 1 }, 500);
        window.setTimeout(function() {
            window.generic.globs.pageManager.setWorldDirty();
        }, 200);
    };

    PageManager.prototype.setWorldDirty = function() {
        this.world.m_dirty = true;
    }

    PageManager.prototype.dispose = function() {
        if (this.navigation) {
            this.navigation.dispose();
            this.navigation = null;
        }

        _.forEach(this.controlsPool, function (element, index, array) {
            if (element) {
                element.dispose();
            }
        });

        this.pageElements.topRightButton.removeEventListener(Touch.maTouchUp, this.topRightButtonClickHandler_context);

        generic.globs.serverCommandManager.removeCommands("common");
        commands.ui.disposeUIElements(this.pageButtons);
        $(this.globalSettings).off("propertyChanged", this.globalSettingsChangeHandler_context);

        GlobalTimers.RemoveRefreshTimerEventHandler(this.refreshTimerHandler_context);
        DataHandlerManager.Unregister(this.commonDataHandler.name);
    };


    var NavigationButton = (function() {
        var NavigationButton = function ($element) {
            this.$button = $element;
            this.buttonDOMElement = $element[0];
            this.$name = $(".text", this.$button);
            this.currentHandler = null;
        };

        NavigationButton.prototype.setText = function (text) {
            this.$name.text(text);
        };

        NavigationButton.prototype.on = function(handler) {
            this.off(this.currentHandler);
            this.currentHandler = handler;
            this.buttonDOMElement.addEventListener(Touch.maTouchUp, this.currentHandler);
        };

        NavigationButton.prototype.off = function() {
            if (this.currentHandler) {
                this.buttonDOMElement.removeEventListener(Touch.maTouchUp, this.currentHandler);
            }
        };

        NavigationButton.prototype.dispose = function() {

        };

        return NavigationButton;
    })();

    var PhoneModeNavigation = (function(){
        // pageManager - interface
        // {
        //     getPages: array,
        //     getMainPage: page,
        //     showPage: function(id, data){},
        //     togglePage: function(id, data){},
        //     getLayout: function(){}
        // }
        var Navigation = function(pageManager, $container, dispatcher) {
            this.navigationBar = null;
            this.modalPageHeader = null;
            this.currentNavigationItem = null;
            this.pageManager = pageManager;
            this.$container = $container;
            this.dispatcher = dispatcher;

            this.actions = [
                {
                    type: this.dispatcher.actions.CHANGE_TITLE,
                    handler: this.onChangeTitle.bind(this)
                }
            ];

            this.dispatcher.register(this.actions);
        };

        Navigation.prototype.show = function(page, pageData) {
            this.pageChanged(page, pageData);
        };

        Navigation.prototype.pageChanged = function(page, pageData) {
            var mode = this.pageManager.getLayout();
            if (mode === "phone") {
                var headerToHide = (pageData && pageData.userDefined && pageData.userDefined.modal) ? this.navigationBar : this.modalPageHeader;
                var headerToShow = !(pageData && pageData.userDefined && pageData.userDefined.modal) ? this.getNavigationBar() : this.getModalPageHeader();

                if (headerToShow === this.navigationBar) {
                    var prevPageTitle = getPage.call(this, conditions.isCurrent, selectors.previous).title;
                    var nextPageTitle = getPage.call(this, conditions.isCurrent, selectors.next).title;

                    this.navigationBar.setData({
                        prevTitle: prevPageTitle,
                        curTitle: page.title,
                        nextTitle: nextPageTitle
                    });
                } else {
                    this.modalPageHeader.setData({
                        curTitle: page.title
                    });
                }

                if (headerToHide) {
                    headerToHide.hide();
                }

                headerToShow.show();

                this.currentNavigationItem = headerToShow;
            } else {
                this.currentNavigationItem = null;
            }
        };

        Navigation.prototype.onChangeTitle = function (type, data) {
            if (!this.currentNavigationItem) {
                return;
            }

            this.currentNavigationItem.setData({
                curTitle: data
            });
        };

        var conditions = {
            isCurrent: function(page){
                return page.current;
            },

            isMain: function(page){
                return page.mainMenu;
            }
        };

        var selectors = {
            previous: function(curIndex, min, max){
                return (curIndex === min) ? max : (curIndex - 1);
            },
            next: function(curIndex, min, max){
                return (curIndex === max) ? min : curIndex + 1;
            },
            nop: function(curIndex, min, max){
                return curIndex;
            }
        };

        var getPage = function(condition, selector) {
            var allPages = this.pageManager.getPages();
            for (var i = 0; i < allPages.length; i++) {
                if(condition(allPages[i])){
                    var index = selector(i, 0, allPages.length - 1);
                    return allPages[index];
                }
            }
            var index = selector(0, 0, allPages.length - 1);
            return allPages[index];
        };
        var navigationBarEventHandlers = {
            showPreviousPage: function() {
                var page = getPage.call(this, conditions.isCurrent, selectors.previous);
                this.pageManager.showPage(page.id);
            },
            showMainMenuPage: function() {
                var page = this.pageManager.getMainPage();
                this.pageManager.togglePage(page.id, {modal: true});
            },
            showNextPage: function() {
                var page = getPage.call(this, conditions.isCurrent, selectors.next);
                this.pageManager.showPage(page.id);
            }
        };
        Navigation.prototype.getNavigationBar = function(page){
            if (this.navigationBar) {
                return this.navigationBar;
            }

            this.navigationBar = new window.uiTypes.HorizontalNavigationBar(this.$container);
            this.navigationBar.setData({
                prevHandler: navigationBarEventHandlers.showPreviousPage.bind(this),
                curHandler: navigationBarEventHandlers.showMainMenuPage.bind(this),
                nextHandler: navigationBarEventHandlers.showNextPage.bind(this)
            });

            return this.navigationBar;
        };

        var modalPageHeaderEventHandlers = (function(){
            return {
                closeMainPage: function(){
                    this.pageManager.togglePage();
                }
            };
        })();
        Navigation.prototype.getModalPageHeader = function(){
            if (this.modalPageHeader) {
                return this.modalPageHeader;
            }

            this.modalPageHeader = new window.uiTypes.ModalHorizontalNavigationBar(this.$container);
            this.modalPageHeader.setData({
                curHandler: modalPageHeaderEventHandlers.closeMainPage.bind(this),
                nextHandler: modalPageHeaderEventHandlers.closeMainPage.bind(this)
            });

            return this.modalPageHeader;
        };

        Navigation.prototype.hide = function(){
            this.navigationBar.hide();
            this.modalPageHeader.hide();
        };

        Navigation.prototype.dispose = function(){
            if (this.navigationBar) {
                this.navigationBar.dispose();
            }

            if (this.modalPageHeader) {
                this.modalPageHeader.dispose();
            }

            this.currentNavigationItem = null;
            this.dispatcher.unregister(this.actions);
        };

        return Navigation;
    })();

    var TabletModeNavigation = (function(){
        var Navigation = function (pageManager, $container, dispatcher) {
            this.pageManager = pageManager;
            this.$container = $container;
            this.showPageHandler = showPageHandler.bind(this);
            this.showMainMenuPageHandler = showMainMenuPageHandler.bind(this);
            this.dispatcher = dispatcher;

            this.actions = [
                {
                    type: this.dispatcher.actions.CHANGE_TITLE,
                    handler: this.onChangeTitle.bind(this)
                }
            ];

            this.dispatcher.register(this.actions);
        };

        var showPageHandler = function(event) {
            var $target = $(event.currentTarget);
            var pageId = $target.attr("data-id");
            this.pageManager.showPage(pageId);
        };

        var showMainMenuPageHandler = function(event) {
            var page = this.pageManager.getMainPage();
            this.pageManager.togglePage(page.id, {modal: true});
        };

        Navigation.prototype.show = function(page, pageData){
            this.pageChanged(page, pageData);
        };

        Navigation.prototype.pageChanged = function(page, pageData) {
            if (!this.navigationBar) {
                this.navigationBar = new window.uiTypes.TabletNavigationBar(this.$container);
            }

            var data = {
                items:[],
                options: {
                    containerClickHandler: this.showMainMenuPageHandler
                }
            };
            var pages = this.pageManager.getPages();
            for (var i = 0; i < pages.length; i++) {
                data.items.push({
                    title: pages[i].title,
                    id: pages[i].id,
                    handler: this.showPageHandler,
                    active: pages[i].id === page.id,
                    icon: pages[i].icon
                });
            }
            this.navigationBar.setData(data);
            this.navigationBar.show();
        };

        Navigation.prototype.onChangeTitle = function (type, data) {
            if (!this.navigationBar) {
                return;
            }

            this.navigationBar.setTitle(data);
        };

        Navigation.prototype.dispose = function() {
            if (this.navigationBar) {
                this.navigationBar.dispose();
                this.navigationBar = null;
            }

            this.dispatcher.unregister(this.actions);
        };

        return Navigation;
    })();

    return PageManager;
})();
