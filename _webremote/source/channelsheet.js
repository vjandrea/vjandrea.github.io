window.uiTypes.pages.ChannelSheet = (function(){
    var PageBase = window.uiTypes.pages.Page;

    var ChannelSheet = function (commandLine, commandExecutor) {
        ChannelSheet.superclass.constructor.call(this, $.createItem({ class:"canvas-container", html: "<div><canvas>Sorry, your browser is not supported.</canvas></div>"}));

        this.requirements = {
            showDimmerWheel: true
        };

        this.m_commandLine = commandLine;
        this.m_commandExecutor = commandExecutor;

        this.itemSelected_context = this.ItemSelected.bind(this);
        this.notificationHandler_context = this.notificationHandler.bind(this);

        this.m_notifyCommands = {};
        this.m_actualNotifications = {};
    }
    window.generic.extend(ChannelSheet, window.uiTypes.pages.CanvasPage);

    ChannelSheet.prototype.CreateWindow = function () {
        this.m_ma2window = new window.uiTypes.canvas.ChannelSheetWindow(this.canvas, uiTypes.canvas.ChannelSheetCell, CanvasRenderer(this.canvas[0].getContext("2d")), { top: 0, left: 0, width: this.canvas[0].width, height: this.canvas[0].height });
        this.m_ma2window.init();
        $(this.m_ma2window).bind(this.m_ma2window.itemSelectedEvent, this.itemSelected_context);
        DataHandlerManager.Register({ name: this.id + "DataHandler", handler: this.m_ma2window.SetDataSource.bind(this.m_ma2window) });

        this.CreatePageButtons();
        for (var i = 0; i < this.pageButtons.length; i++) {
            this.pageButtons[i].command.on(this.notificationHandler_context, { id: this.pageButtons[i].command.getType().id });
            this.m_actualNotifications[this.pageButtons[i].command.getType().id] = undefined;
            this.pageButtons[i].command.init();
        }
        $(this).triggerHandler(PageBase.events.pageButtonsChanged, { buttons: this.pageButtons });
    };

    ChannelSheet.prototype.RefreshTimerCallback = function () {
        ChannelSheet.superclass.RefreshTimerCallback.call(this);
        if (!this.m_ma2window) {
            return;
        }

        if(this.m_actualNotifications[commands.CommandType.hideName.id] !== undefined) {
            this.m_ma2window.hideNamesChanged();
            this.m_actualNotifications[commands.CommandType.hideName.id] = undefined;
        }
    };

    ChannelSheet.prototype.GetPayloadObject = function () {
        var payload = new Object();
        payload.requestType = Server.requestTypes.channelSheet;
        payload.cntCols = 3;
        payload.cntRows = this.m_ma2window.GetVisibleItemsCount();
        payload.offRow = this.m_ma2window.GetDataOffsetY();
        payload.offCol = 0;
        payload.layerMode = this.m_ma2window.GetCommandState(commands.CommandType.presetValue).value;
        payload.sortCh = this.m_ma2window.GetCommandState(commands.CommandType.channelSort).value ? "1" : "0";
        return payload;
    };

    ChannelSheet.prototype.notificationHandler = function(event, params) {
        if (!params || (params.state === undefined) || !event.data || (event.data.id === undefined)) {
            return;
        }
        this.m_actualNotifications[event.data.id] = params.state;
    };

    ChannelSheet.prototype.CreatePageButtons = function() {
        if(!this.pageButtons){
            var getCommandState = this.m_ma2window.GetCommandState.bind(this.m_ma2window);
            var setCommandState = this.m_ma2window.SetCommandState.bind(this.m_ma2window);

            var progOnlyHandler = (function(command, eventType){
                commands.defaultCommandHandler(command, eventType);
                this.m_ma2window.ResetFocusAndOffset();
            }).bind(this);

            this.pageButtons = [
                { command: commands.StateCommand(commands.CommandType.presetValue, commands.ui.defaultCommandExecute, getCommandState, setCommandState), uiElement: commands.ui.UIDropDown() },
                { command: commands.StateCommand(commands.CommandType.progOnly, progOnlyHandler), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.StateCommand(commands.CommandType.channelSort, commands.ui.defaultCommandExecute, getCommandState, setCommandState), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.StateCommand(commands.CommandType.hideName, commands.ui.defaultCommandExecute, getCommandState, setCommandState), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.Commands.high(), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.Commands.clear(), uiElement: commands.ui.UIMultiStateButton() },
            ];
            this.pageButtons.forEach(commands.ui.initCommandUIElementPair);
            generic.globs.serverCommandManager.addCommands(this.id, this.pageButtons);
        }
        return this.pageButtons;
    };

    ChannelSheet.prototype.Init = function () {
        ChannelSheet.superclass.Init.call(this);

        this.$page.append(this.canvasContainer);
    };
    ChannelSheet.prototype.ItemSelected = function (event, args) {
        var ids = (args.ids instanceof Array) ? args.ids.join("+") : args.ids;
        this.m_commandExecutor.send({ command: "channel " + ids });
    };
    ChannelSheet.prototype.Close = function () {
        $(this.m_ma2window).unbind(this.m_ma2window.itemSelectedEvent, this.itemSelected_context);

        ChannelSheet.superclass.Close.call(this);
    };
    ChannelSheet.id = "channelSheet";
    ChannelSheet.title = "Channel Sheet";
    ChannelSheet.content = '<div id="' + ChannelSheet.id + '"></div>';

    return ChannelSheet;
})();

(function(ns){
    var ChannelSheetWindow = function (parentElement, cellClass, renderer, rect) {
        ChannelSheetWindow.superclass.constructor.call(this, parentElement, renderer, rect);

        this.config = {
            hideName: {
                true: {
                    fontSizeToCellHeightCoef: 3,
                    fontSizeToCellWidthCoef: 4
                },
                false: {
                    fontSizeToCellHeightCoef: 4,
                    fontSizeToCellWidthCoef: 4
                }
            }
        };

        $.extend(this.m_defaultSettings, {
            hScrollVisible: false,
            vScrollVisible: true,

            fixedColumnsCount: 0,
            titleRows: 0,

            storage: Storage.AddSection("ChannelSheet")
        });

        this.cellBuilder = new uiTypes.canvas.CellBuilder(cellClass.model);

        this.cell = new cellClass(this.renderer);

        this.m_selectedItems = [];
    };
    window.generic.extend(ChannelSheetWindow, window.uiTypes.canvas.CanvasBlockBox);

    ChannelSheetWindow.prototype.init = function () {
        $.extend(this.m_defaultSettings, this.config.hideName[this.GetCommandState(commands.CommandType.hideName).value]);

        ChannelSheetWindow.superclass.init.call(this);

        this.SetColsCount(this.GetVisibleColsCount());
        var offset = this.m_defaultSettings.storage.Load("offset", {x:0,y:0});
        var focus = this.m_defaultSettings.storage.Load("focus", {x:0,y:0});
        this.setOffset(offset);
        this.setFocus(focus);
    };

    ChannelSheetWindow.prototype.hideNamesChanged = function() {
        var state = this.GetCommandState(commands.CommandType.hideName).value;
        $.extend(this.m_defaultSettings, this.config.hideName[state]);
        this.setFontSize();
        state ? this.cellBuilder.hide("name") : this.cellBuilder.show("name");
    };

    ChannelSheetWindow.prototype.SetDataSource = function (consolereturn) {
        if (!consolereturn || (consolereturn.responseType != Server.requestTypes.channelSheet)) {
            return false;
        }

        var channelsheet = consolereturn;
        //utilities.performance.start();
        this.SetItemsCount(channelsheet.cntRows);
        this.refresh(channelsheet);
        //utilities.performance.end();

        return true;
    };

    ChannelSheetWindow.prototype.refresh = function (channelsheet) {
        ChannelSheetWindow.superclass.refresh.call(this);
        if (!channelsheet) {
            return;
        }
        if (!channelsheet.data) {
            return;
        }

        this.Stretch();

        // Send select channel command
        if (this.m_selectedItems.length > 0) {
            var channelIdRequestString = [];

            for (var i = 0; i < this.m_selectedItems.length; ++i) {
                var row = this.m_selectedItems[i];
                if ((0 <= row) && (row < channelsheet.data.length)) {
                    var channelId = channelsheet.data[row][0][0];
                    var fixtureAndChannelId = channelId.split(':');
                    if (fixtureAndChannelId.length == 1) {
                        channelIdRequestString.push(fixtureAndChannelId);
                    } else if (fixtureAndChannelId[1]) {
                        channelIdRequestString.push(fixtureAndChannelId[1]);
                    }
                }
            }

            this.onItemSelected({ ids: channelIdRequestString });

            this.m_selectedItems.length = 0;
        }

        this.draw(channelsheet.data);

        this.drawScrollBars();
    };

    ChannelSheetWindow.prototype.draw = function (data) {
        var maxCols = this.GetVisibleColsCount();
        var currentFocusPos = this.GetFocus();
        var rowIndex = 0;
        var colIndex = 0;
        var model = this.cellBuilder.build();
        var cell = {
            x: 0,
            y: 0,
            width: this.m_containerSettings.cellRenderWidth,
            height: this.m_containerSettings.cellRenderHeight,
            focused: false
        };

        var n_items = data.length + (this.GetVisibleColsCount() - (data.length % this.GetVisibleColsCount())) % this.GetVisibleColsCount();
        for (var i = 0; i < n_items; i++) {
            cell.x = colIndex * this.m_containerSettings.cellRenderWidth;
            cell.y = rowIndex * this.m_containerSettings.cellRenderHeight;
            cell.focused = (colIndex == currentFocusPos.x) && (rowIndex == currentFocusPos.y);
            cell.data = this.getCellData(data[i]);
            this.cell.draw(cell, model);

            ++colIndex;
            if (colIndex >= maxCols) {
                colIndex = 0;
                ++rowIndex;
            }
        }
    };

    ChannelSheetWindow.prototype.getCellData = function (itemData) {
        if (!itemData) {
            return {};
        }
        var cellData = {
            index: {
                text: itemData[0][0],
                color: itemData[0][1],
                background: itemData[0][2]
            },
            name: {
                text: itemData[1][0],
                color: itemData[1][1],
                background: itemData[1][2]
            }
        };

        if (itemData[2]) {
            cellData.value = {
                text: itemData[2][0],
                color: itemData[2][1],
                background: itemData[2][2]
            };
        }
        return cellData;
    };

    ChannelSheetWindow.prototype.SelectRange = function (selectionSize, point, hDirection, vDirection) {
        if (selectionSize) {
            var firstSelectedCell = {
                x: Math.ceil(selectionSize.startX / this.m_containerSettings.cellRenderWidth) - 1,
                y: Math.ceil(selectionSize.startY / this.m_containerSettings.cellRenderHeight) - 1 - this.m_defaultSettings.titleRows
            };

            var lastSelectedCell = {
                x: Math.ceil(selectionSize.endX / this.m_containerSettings.cellRenderWidth) - 1,
                y: Math.ceil(selectionSize.endY / this.m_containerSettings.cellRenderHeight) - 1 - this.m_defaultSettings.titleRows
            };

            if ((firstSelectedCell.y > lastSelectedCell.y) || ((firstSelectedCell.y == lastSelectedCell.y) && (firstSelectedCell.x > lastSelectedCell.x))) {
                var tmp = firstSelectedCell;
                firstSelectedCell = lastSelectedCell;
                lastSelectedCell = tmp;
            }

            this.m_selectedItems.length = 0;

            var firstSelectedCellIndex = (firstSelectedCell.y) * this.GetVisibleColsCount() + firstSelectedCell.x;
            var lastSelectedCellIndex = (lastSelectedCell.y) * this.GetVisibleColsCount() + lastSelectedCell.x;

            if ((vDirection == window.uiTypes.VerticalDirection.BottomToTop) || (hDirection == window.uiTypes.HorizontalDirection.RightToLeft)) {
                for (var i = lastSelectedCellIndex; i >= firstSelectedCellIndex; --i) {
                    this.m_selectedItems.push(i);
                }
            } else {
                for (var i = firstSelectedCellIndex; i <= lastSelectedCellIndex; i++) {
                    this.m_selectedItems.push(i);
                }
            }

        }
    };

    ChannelSheetWindow.prototype.Close = function() {
        this.cellBuilder.dispose();
        ChannelSheetWindow.superclass.Close.call(this);
    };

    ns.ChannelSheetWindow = ChannelSheetWindow;
})(window.uiTypes.canvas);

(function(ns){
    var ChannelSheetCell = function(renderer){
        this.m_renderer = renderer;

        this.m_defaultSettings = {
            fontSize: 1,
            leading: 0.3, // em
            fontFamily: "Helvetica",

            bgColor : remoteColors.channelSheet.cell.backgroundColor,
            textColor: remoteColors.channelSheet.cell.color
        };

        this.m_elements = {
            border: {
                color: remoteColors.channelSheet.cell.border.color,
                size: 2,
                focusColor: remoteColors.channelSheet.cell.border.focusedColor,
                focusSize: 4,
                roundedCornerRadius: 8,
            },

            index: {
                halign: "center",
                valign: "middle"
            },

            name: {
                halign: "center",
                valign: "middle"
            },

            value: {
                halign: "center",
                valign: "middle"
            }
        };

        this.m_rects = {
            default: {},
            cell: {},
            innerCell : {},
            content: {}
        };
    };

    ChannelSheetCell.model =
        '<div class="cs-cell">\
            <div class="cs-top"> <div data-role="color" class="cs-color hidden"></div> <div data-role="index" class="cs-index"></div> </div>\
            <div data-role="name" class="cs-middle cs-name">\
            </div>\
            <div class="cs-bottom">\
                <div data-role="dimmer" class="cs-bottom-left cs-dimmer hidden"></div>\
                <div class="cs-bottom-right"> <div data-role="bar" class="cs-bar"></div> <div data-role="value" class="cs-value"></div> </div>\
            </div>\
        </div>';

    ChannelSheetCell.prototype.calculateLocation = function(base, pivotRect) {
        if (!this.m_rects.content) {
            generic.statusLogging("ChannelSheetCell.prototype.getLocation invalid member variable this.m_rects.content");
            throw Error();
        }

        var rect = pivotRect || (base.noncontent ? this.m_rects.innerCell : this.m_rects.content);

        if (base.pointFrom && base.pointTo) {
            return CanvasRenderer.calculateLocationLine(base, rect);
        }

        if (base.center && base.radius) {
            return CanvasRenderer.calculateLocationCircle(base, rect);
        }

        return CanvasRenderer.calculateLocationRect(base, rect);
    };

    ChannelSheetCell.prototype.drawBackground = function() {
        this.m_renderer.drawRect(this.m_rects.default, 0, 0, this.m_defaultSettings.bgColor);
    };

    ChannelSheetCell.prototype.drawIndex = function(data, model) {
        if (!model["index"] || !data.index) {
            return;
        }

        var rect = this.calculateLocation($.extend(this.m_elements.index, model["index"]));

        this.m_renderer.fillText(
            rect,
            data.index.text,
            { family: this.m_defaultSettings.fontFamily },
            data.index.color || this.m_defaultSettings.textColor,
            this.m_elements.index.halign,
            this.m_elements.index.valign
        );
    };

    ChannelSheetCell.prototype.drawName = function(data, model) {
        if (!model["name"] || !data.name) {
            return;
        }

        var rect = this.calculateLocation($.extend(this.m_elements.name, model["name"]));

        this.m_renderer.fillText(
            rect,
            data.name.text,
            {
                family: this.m_defaultSettings.fontFamily,
                size: this.m_defaultSettings.cellFontSize
            },
            data.name.color || this.m_defaultSettings.textColor,
            this.m_elements.name.halign,
            this.m_elements.name.valign
        );
    };

    ChannelSheetCell.prototype.drawValue = function(data, model) {
        if (!model["value"] || !data.value) {
            return;
        }

        var textRect = this.calculateLocation($.extend(this.m_elements.value, model["value"]));
        var rect = this.calculateLocation(model["value"], this.m_rects.innerCell);

        if (data.value.background) {
            this.m_renderer.drawRect(rect, null, 0, data.value.background);
        }
        this.m_renderer.fillText(
            textRect,
            data.value.text,
            { family: this.m_defaultSettings.fontFamily },
            data.value.color || this.m_defaultSettings.textColor,
            this.m_elements.value.halign,
            this.m_elements.value.valign
        );
    };

    ChannelSheetCell.prototype.drawBorder = function(data, model, focused) {
        var borderSize = focused ? this.m_elements.border.focusSize : this.m_elements.border.size;
        var borderRect = CanvasRenderer.transformRectToBorderRect(this.m_rects.cell, borderSize);

        this.m_renderer.drawRect(
            borderRect,
            focused ? this.m_elements.border.focusColor : this.m_elements.border.color,
            focused ? this.m_elements.border.focusSize : this.m_elements.border.size,
            null
        );
    };

    ChannelSheetCell.prototype.draw = function (cell, model) {
        var data = cell.data;

        this.m_rects.cell = this.m_rects.default = utilities.math.roundRect(cell);

        var frameSize = utilities.math.getMinMax(this.m_elements.border.focusSize, this.m_elements.border.size);

        this.m_rects.innerCell = CanvasRenderer.getContentRect(this.m_rects.cell, frameSize.min);
        this.m_rects.content = CanvasRenderer.getContentRect(this.m_rects.cell, frameSize.max);

        this.drawBackground();
        this.drawIndex(data, model);
        this.drawName(data, model);
        this.drawValue(data, model);

        this.drawBorder(data, model, cell.focused);
    };

    ns.ChannelSheetCell = ChannelSheetCell;
})(window.uiTypes.canvas);
