defineNamespace(window, "uiTypes.canvas");
defineNamespace(window, "uiTypes.pages");

(function (ns) {
    var PageBase = window.uiTypes.pages.Page;

    var GroupPool = function(commandLine, commandExecutor, globalSettings) {
        GroupPool.superclass.constructor.call(this, $.createItem({ class:"canvas-container", html: "<div><canvas></canvas></div>"}), commandLine, commandExecutor, globalSettings);
    };
    window.generic.extend(GroupPool, window.uiTypes.pages.PoolPage);

    GroupPool.prototype.GetWindowClass = function () {
        return window.uiTypes.canvas.GroupPoolWindow;
    };

    GroupPool.prototype.CreateWindow = function () {
        GroupPool.superclass.CreateWindow.call(this);
        $(this).triggerHandler(PageBase.events.pageButtonsChanged, { buttons: this.CreatePageButtons() });
    };

    GroupPool.prototype.CreatePageButtons = function() {
        if(!this.pageButtons){
            this.pageButtons = [
                { command: commands.Commands.high(), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.Commands.clear(), uiElement: commands.ui.UIMultiStateButton() }
            ];
            this.pageButtons.forEach(commands.ui.initCommandUIElementPair);
            generic.globs.serverCommandManager.addCommands(this.id, this.pageButtons);
        }
        return this.pageButtons;
    };

    GroupPool.prototype.ItemSelected = function (event, args) {
        var id = args.id;
        var cmdlineText = this.m_commandLine.getText();

        this.m_commandExecutor.send({
            requestType: Server.requestTypes.pool_itemSelected,
            pool: GroupPool.shortId,
            id_1: id,
            cmdlineText: cmdlineText
        });
    };
    GroupPool.id = "groupPool";
    GroupPool.shortId = "group";
    if(isDot2())
    {
        GroupPool.title = "Groups";
    }
    else
    {
        GroupPool.title = "Group Pool";
    }
    GroupPool.content ='<div id="' + GroupPool.id + '"></div>';

    ns.GroupPool = GroupPool;
})(window.uiTypes.pages);

(function(ns){
    var GroupPoolWindow = function(parentElement, renderer, rect) {
        GroupPoolWindow.superclass.constructor.call(this, parentElement, renderer, rect, ns.GroupPoolCell);

        $.extend(this.m_defaultSettings, {
            storage: Storage.AddSection("GroupPool")
        });
    };
    window.generic.extend(GroupPoolWindow, window.uiTypes.canvas.PoolWindow);
    GroupPoolWindow.prototype.getItem = function (poolData, itemData) {
        var item = GroupPoolWindow.superclass.getItem(poolData, itemData);
        $.extend(item, {
            stateStripeColor: itemData.stateStripeC,
            isReferenced: itemData.isRef,
            miscRects: itemData.cntNotInWorld ? [{ width: itemData.cntNotInWorld }] : undefined
        });
        return item;
    };
    GroupPoolWindow.prototype.SetDataSource = function (consolereturn) {
        if(consolereturn.responseType != Server.requestTypes.pool) {
            return false;
        }
        if (consolereturn.pool != "group") {
            return false;
        }

        return GroupPoolWindow.superclass.SetDataSource.call(this, consolereturn);
    };

    var GroupPoolCell = function(renderer) {
        GroupPoolCell.superclass.constructor.call(this, renderer);

        if(isDot2())
        {
            $.extend(this.m_defaultSettings, {
                margin: {
                    top:    0.0,
                    left:   0.0,
                    bottom: 0.0,
                    right:  0.0
                }, // percents
                padding: {
                    top:    0.00,
                    left:   0.00,
                    bottom: 0.00,
                    right:  0.00
                }, // percents
            });
        }
        else
        {
            $.extend(this.m_defaultSettings, {
            });
        }

        if(!isDot2())
        {
            this.stateStripe.enabled = true;

            this.miscRects = {
                array: [
                    {
                        color: remoteColors.groupPool.cell.miscRects.color,
                        pointFrom: {
                            x: 0,
                            y: 0.5
                        },
                        pointTo : {
                            x: 1,
                            y: 0.5
                        },
                        width: 0.06,
                    }
                ]
            };
        }
    };
    window.generic.extend(GroupPoolCell, window.uiTypes.canvas.PoolCell);

    ns.GroupPoolWindow = GroupPoolWindow;
    ns.GroupPoolCell = GroupPoolCell;

})(window.uiTypes.canvas);
