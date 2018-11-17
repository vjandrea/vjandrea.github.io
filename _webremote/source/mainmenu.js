window.uiTypes.pages.MainMenu = (function(){

    var MainMenu = function(commandLine, commandExecutor, globalSettings) {
        MainMenu.superclass.constructor.call(this, commandLine, commandExecutor, globalSettings);

        this.requirements = {
            presetTypeBar: true
        };

        this.columnsCount = 3;
        this.m_pressLoginButton_context = this.pressLoginButton.bind(this);
        this.m_pressConnectDisconnectButton_context = this.pressConnectDisconnectButton.bind(this);
        this.m_pressSettingsButton_context = this.pressSettingsButton.bind(this);
    };
    window.generic.extend(MainMenu, window.uiTypes.pages.Page);
    MainMenu.id = "mainMenu";
    MainMenu.title = "Main Menu";

    // CREATE TEMPLATE FOR THIS PAGE!!!!!!!!!!!!!!!!!!!!!!!!!!

    MainMenu.content =
    '<div id="' + MainMenu.id + '">' +
        '<div class="main">' +
            '<div class="main-menu-section basic basic-js">' +
                '<div class="title"><span class="content">Views</span></div>' +
                '<div class="navigationPanel"></div>' +
            '</div>' +
            '<div class="main-menu-section additional additional-js">' +
                '<div class="title"><span class="content">Additional operations</span></div>' +
                '<div class="navigationPanel">';
                    if(!isDot2())
                    {
                    MainMenu.content += '<div id="loginButton" class="navigationBlock menu-item">' +
                        '<span class="content">Login</span>' +
                    '</div>';
                    }
                    MainMenu.content += '<div id="connectButton" class="navigationBlock menu-item">' +
                        '<span class="content" id="connectButtonContent">Connected... - Disconnect</span>' +
                    '</div>' +
                    '<div id="settingsButton" class="navigationBlock menu-item">' +
                        '<span class="content">Settings</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

    MainMenu.prototype.Init = function () {
        MainMenu.superclass.Init.call(this);

        this.m_loginButton = document.getElementById("loginButton");
        this.m_connectButton = document.getElementById("connectButton");
        this.m_settingsButton = document.getElementById("settingsButton");

        if(this.m_loginButton)
        {
            this.m_loginButton.addEventListener(Touch.maTouchDown, this.m_pressLoginButton_context);
        }
        this.m_connectButton.addEventListener(Touch.maTouchDown, this.m_pressConnectDisconnectButton_context);
        this.m_settingsButton.addEventListener(Touch.maTouchDown, this.m_pressSettingsButton_context);
    };

    MainMenu.prototype.pressConnectDisconnectButton = function () {
        if (this.m_commandExecutor.IsConnected()) {
            window.ui.forcedDisconnect = true;
            this.m_commandExecutor.disconnect();
        } else {
            window.ui.forcedDisconnect = false;
            this.m_commandExecutor.connect();
        }
    };

    MainMenu.prototype.pressLoginButton = function() {
        window.Server.SetLoginState(false);
        window.ui.loginForm.Show();
    };

    MainMenu.prototype.pressSettingsButton = function() {
        window.generic.globs.pageManager.TogglePage(window.uiTypes.pages.Settings.id, {modal: true});
    };

    MainMenu.prototype.Show = function () {
        MainMenu.superclass.Show.call(this);

        var pagesInChain = window.generic.globs.pageManager.getPageChain();
        var chainDataStruct = [];
        for (var i = 0; i < pagesInChain.length; i++) {
            var current = pagesInChain[i];
            chainDataStruct.push({
                text: current.title,
                bind: this.openPage.bind(this, current.id)
            });
        }

        var basicNavigationPanel = $(".basic-js .navigationPanel", this.$page);
        var arrowTemplate = "<div class='arrow'></div>";
        var blockTemplate = $("<div class='navigationBlock'><span class='content text'></span></div>");
        $.ButtonBlock.create(chainDataStruct, this.columnsCount, basicNavigationPanel, blockTemplate, arrowTemplate);
    };

    MainMenu.prototype.openPage = function (pageId, control) {
        control[0].addEventListener(Touch.maTouchUp, function (e) {
            window.generic.globs.pageManager.ShowPage(pageId);
        });
    };

    MainMenu.prototype.Close = function () {
        MainMenu.superclass.Close.call(this);

        if(this.m_loginButton)
        {
            this.m_loginButton.removeEventListener(Touch.maTouchDown, this.m_pressLoginButton_context);
        }
        this.m_connectButton.removeEventListener(Touch.maTouchDown, this.m_pressConnectDisconnectButton_context);
        this.m_settingsButton.removeEventListener(Touch.maTouchDown, this.m_pressSettingsButton_context);
    };

    return MainMenu;

})();
