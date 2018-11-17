defineNamespace(window, "uiTypes.pages");
defineNamespace(window, "uiTypes.canvas");

(function (ns) {
    var PageBase = window.uiTypes.pages.Page;

    var ExecutorSheet = function (commandLine, commandExecutor, globalSettings, dispatcher) {
        ExecutorSheet.superclass.constructor.call(this, $.createItem({ class: "canvas-container", html: "<div><canvas></canvas></div>" }), commandLine, commandExecutor, globalSettings, dispatcher);

        if(!isDot2())
        {
            this.kDefaultFilterValue = "All";
            this.filterCommand = {
                id: "executorSheetFilters",
                title: "Filters",
                change: true
            };
            this.m_filters = null;
        }

        this.m_pageLocalDispatcher = Dispatcher();
        this.m_pageLocalDispatcher.actions = {
            SEQUENCE_EXECUTOR_CHANGED: "sequence_executor_changed"
        };

        this.actions = [
            {
                type: this.m_pageLocalDispatcher.actions.SEQUENCE_EXECUTOR_CHANGED,
                handler: this.onSequenceExecutorChanged.bind(this)
            }
        ];

        //this.itemSelected_context = this.ItemSelected.bind(this);
    };
    window.generic.extend(ExecutorSheet, window.uiTypes.pages.CanvasPage);
    ExecutorSheet.prototype.Init = function () {
        ExecutorSheet.superclass.Init.call(this);

        this.m_pageLocalDispatcher.register(this.actions);
    };
    ExecutorSheet.prototype.CreateWindow = function () {
        this.m_ma2window = new window.uiTypes.canvas.ExecutorSheetWindow(this.canvas, window.CanvasRenderer(this.canvas[0].getContext("2d")), { top: 0, left: 0, width: this.canvas[0].width, height: this.canvas[0].height }, this.m_pageLocalDispatcher);
        this.m_ma2window.init();
        this.m_ma2window.setConfig(generic.globs.config.layout[this.m_globalSettings.layout][this.id]);
        //$(this.m_ma2window).bind(this.m_ma2window.itemSelectedEvent, this.itemSelected_context);
        DataHandlerManager.Register({
            name: this.id + "DataHandler", handler: (function (consolereturn) {
            if (!consolereturn || (consolereturn.responseType != Server.requestTypes.executorSheet)) {
                return false;
            }

            if (!this.m_filters && consolereturn.filters) {
                this.m_filters = consolereturn.filters;

                $(this).triggerHandler(PageBase.events.pageButtonsChanged, { buttons: this.CreatePageButtons() });

                this.OnResize();
            }

            return this.m_ma2window.onDataReceived(consolereturn);
        }).bind(this) });
    };

    ExecutorSheet.prototype.GetPayloadObject = function () {
        var payload = ExecutorSheet.superclass.GetPayloadObject.call(this);
        payload.requestType = Server.requestTypes.executorSheet;
        payload.cntCols = this.m_ma2window.GetVisibleColsCount() + 1;
        payload.cntRows = this.m_ma2window.GetVisibleRowsCount();
        payload.offCol = this.m_ma2window.GetDataOffsetX();
        payload.offRow = this.m_ma2window.GetDataOffsetY();
        payload.forceAutoScroll = this.m_ma2window.m_forceAutoScroll;
        if (!this.m_ma2window.hasColumns()) {
            payload.needCols = "1";
        }
        return payload;
    };

    ExecutorSheet.prototype.onSequenceExecutorChanged = function (type, data) {
        var newTitle = this.title + " E:" + data.executor + ", S: " + data.sequence;
        this.m_dispatcher.trigger({
            type: this.m_dispatcher.actions.CHANGE_TITLE,
            data: newTitle
        });
    };

    ExecutorSheet.prototype.CreatePageButtons = function() {
        if(this.pageButtons){
            return this.pageButtons;
        }

        if (!this.m_filters) {
            return null;
        }

        var getCommandState = this.m_ma2window.GetCommandState.bind(this.m_ma2window);
        var setCommandState = this.m_ma2window.SetCommandState.bind(this.m_ma2window);

        var commandStates = [{ value: this.kDefaultFilterValue, text: this.kDefaultFilterValue, default: true }];
        for(var key in this.m_filters) {
            commandStates.push({ value: key, text: key });
        }

        commands.addCommandType(commands.createCommandType(
            $.extend({}, this.filterCommand, {states: commandStates})
        ));

        this.pageButtons = [{
            command: commands.StateCommand(
                commands.CommandType[this.filterCommand.id],
                commands.ui.defaultCommandExecute,
                getCommandState,
                (function(commandType, value) {
                    this.m_ma2window.SetCommandState(commandType, value);
                    var filterState = this.m_ma2window.GetCommandState(commands.CommandType[this.filterCommand.id]);
                    if (filterState) {
                        this.m_ma2window.setFilter(this.m_filters[filterState.value],filterState.value);
                        this.m_ma2window.setFocus({x: 0});
                    }
                }).bind(this)),
            uiElement: commands.ui.UIRadioStateButton()
        }];

        var filterState = getCommandState(commands.CommandType[this.filterCommand.id]);
        this.m_ma2window.setFilter(this.m_filters[filterState.value],filterState.value);

        this.pageButtons.forEach(commands.ui.initCommandUIElementPair);
        generic.globs.serverCommandManager.addCommands(this.id, this.pageButtons);

        return this.pageButtons;
    };

    ExecutorSheet.prototype.globalSettingsChangeHandler = function(event, args) {
        if (args.name === "layout") {
            this.m_ma2window.setConfig(generic.globs.config.layout[args.newValue][this.id]);
        }
    };

    // ExecutorSheet.prototype.ItemSelected = function (event, args) {
    //     var ids = (args.ids instanceof Array) ? args.ids.join("+") : args.ids;

    //     var command = !args.attribute ? "fixture" : "attribute";
    //     this.m_commandExecutor.send({ command: command + " " + ids });
    // };
    ExecutorSheet.prototype.Close = function () {
        //$(this.m_ma2window).unbind(this.m_ma2window.itemSelectedEvent, this.itemSelected_context);

        this.m_dispatcher.trigger({
            type: this.m_dispatcher.actions.CHANGE_TITLE,
            data: this.title
        });
        this.m_pageLocalDispatcher.unregister(this.actions);

        ExecutorSheet.superclass.Close.call(this);
    };
    ExecutorSheet.id = "executorSheet";
    if(isDot2())
    {
        ExecutorSheet.title = "Cues";
    }
    else
    {
        ExecutorSheet.title = "Executor Sheet";
    }
    ExecutorSheet.content = '<div id="' + ExecutorSheet.id + '"></div>';

    ns.ExecutorSheet = ExecutorSheet;
})(window.uiTypes.pages);

(function(ns){
    var ExecutorSheetWindow = function(parentElement, renderer, rect, dispatcher) {
        ExecutorSheetWindow.superclass.constructor.call(this, parentElement, renderer, rect, dispatcher);

        $.extend(this.m_defaultSettings, {
            fontSizeToCellHeightCoef: 5 / 3,
            fontSizeToCellWidthCoef: 20 / 3,
            headerSelectedAttributeColor: remoteColors.executorSheet.headerSelectedAttributeColor,
            headerSelectedPresetColor: remoteColors.executorSheet.headerSelectedPresetColor,
            headerCellBackgroundColor: remoteColors.executorSheet.headerCellBackgroundColor,
            cellStrokeStyle: remoteColors.executorSheet.borderColor,
            cellStrokeStyleAlternative: remoteColors.executorSheet.borderColorAlternative,
            headerCellStrokeStyle: remoteColors.executorSheet.headerBorderColor,

            hScrollVisible: true,
            vScrollVisible: true,

            fixedColumnsCount: 0,
            titleRows: 1,

            storage: Storage.AddSection("ExecutorSheet")
        });

        this.m_selectedRows = [];
        this.m_lastActiveIndex = -1;
        this.m_selectedHeaderColumn = -1;
        this.m_columns = null;
        this.m_filter = null;
        this.m_filterName = "";
        this.m_sequence = "";
        this.m_exec = "";
    };
    window.generic.extend(ExecutorSheetWindow, window.uiTypes.canvas.CanvasGrid);
    ExecutorSheetWindow.prototype.init = function () {
        ExecutorSheetWindow.superclass.init.call(this);

        var offset = this.m_defaultSettings.storage.Load("offset", {x:0,y:0});
        var focus = this.m_defaultSettings.storage.Load("focus", {x:0,y:0});
        this.setOffset(offset);
        this.setFocus(focus);

        this.m_redrawWholeCanvas = true;
    };

    ExecutorSheetWindow.prototype.onDataReceived = function (consolereturn) {
        if (!consolereturn || (consolereturn.responseType != Server.requestTypes.executorSheet)) {
            return false;
        }

        var sheetData = consolereturn;

        var totalRows = sheetData.cntRows;
        if (totalRows === undefined) {
            return false;
        }

        if (sheetData.cols) {
            this.m_columns = sheetData.cols;
        }

        if (!this.m_columns) {
            generic.statusLogging("ExecutorSheetWindow.draw - invalid argument 'columns'");
            return;
        }

        if ((this.m_sequence != sheetData.seq) || (this.m_exec != sheetData.exec)) {
            this.m_sequence = sheetData.seq;
            this.m_exec = sheetData.exec;

            this.m_dispatcher.trigger({
                type: this.m_dispatcher.actions.SEQUENCE_EXECUTOR_CHANGED,
                data: {
                    sequence: this.m_sequence,
                    executor: this.m_exec
                }
            });
        }

        this.m_filteredColumns = this.m_filter || this.m_columns;

        var totalCols = this.m_filteredColumns.length;

        this.SetColsCount(totalCols);
        this.SetRowsCount(totalRows);

        if ((sheetData.offRow != undefined) && (sheetData.offRow >= 0)) {
            this.setOffset({ y: sheetData.offRow });
        }

            var indexX = Math.min(totalCols - 1, this.m_containerOffset.x + this.m_focusPos.x);
            var indexY = Math.min(totalRows - 1, this.m_containerOffset.y + this.m_focusPos.y);

            var visibleRowsCount = this.GetVisibleRowsCount();
            var visibleColsCount = this.GetMaxVisibleColsCount();

            var newFocusValue = {
                x: Math.min(Math.min(totalCols - 1, visibleColsCount - 1) - this.m_defaultSettings.fixedColumnsCount, this.m_focusPos.x),
                y: Math.min(Math.min(totalRows - 1, visibleRowsCount - 1), this.m_focusPos.y)
            };

            var newOffsetValue = {
                x: indexX - newFocusValue.x,
                y: indexY - newFocusValue.y
            };

            while (visibleRowsCount + newOffsetValue.y > totalRows) {
                if (newOffsetValue.y > 0) {
                    --newOffsetValue.y;
                    if (newFocusValue.y < totalRows - 1) {
                        ++newFocusValue.y;
                    }
                } else {
                    break;
                }
            }

            while (visibleColsCount + newOffsetValue.x > totalCols ) {
                if (newOffsetValue.x > 0) {
                    --newOffsetValue.x;
                    if (newFocusValue.x < totalCols - 1) {
                        ++newFocusValue.x;
                    }
                } else {
                    break;
                }
            }

        this.setFocus(newFocusValue, true);
        this.setOffset(newOffsetValue, true);

        var columnWidthArray = [];
        for (var i = 0; i < totalCols; i++) {
            columnWidthArray[i] = this.m_containerSettings.cellWidth;
            if (this.m_filteredColumns[i].n === "Name") {
                columnWidthArray[i] = this.m_containerSettings.cellWidth * 2;
            }
            if(this.m_filteredColumns[i].n === "Info")
            {
                if(this.getLayout() == "tablet")
                {
                    var width = this.GetContentRect().width;
                    var scaleIndex = Math.max(Math.min(width/250,8),1);
                    if(this.m_filterName == "Info")
                    {
                        columnWidthArray[i] = this.m_containerSettings.cellWidth * scaleIndex;
                    }
                    else
                    {
                        columnWidthArray[i] = this.m_containerSettings.cellWidth * scaleIndex;
                    }
                }
                else
                {
                    columnWidthArray[i] = this.m_containerSettings.cellWidth * 2;
                }
            }
        }
        if (columnWidthArray.length > 0) {
            columnWidthArray[0] = this.m_containerSettings.cellWidth / 3 * 2;
        }
        this.m_containerSettings.columnWidth = columnWidthArray;
        this.m_redrawWholeCanvas = true;

        this.m_forceAutoScroll = (sheetData.activeI >= 0) && (this.m_lastActiveIndex != sheetData.activeI);
        this.m_lastActiveIndex = sheetData.activeI;

        this.refresh(sheetData);

        return true;
    };

    ExecutorSheetWindow.prototype.getLayout = function () {
        return generic.globs.config.activeLayout || generic.globs.config.layout.default.id;
    };

    ExecutorSheetWindow.prototype.refresh = function (sheetData) {
        ExecutorSheetWindow.superclass.refresh.call(this);

        if (!sheetData) {
            return;
        }

        this.stretch();

        // // Send select fixture command
        // if (this.m_selectedRows.length > 0) {
        //     var fixtureIdRequestString = [];

        //     for (var i = 0; i < this.m_selectedRows.length; ++i) {
        //         var row = this.m_selectedRows[i];
        //         if ((0 <= row) && (row < sheetData.data.length)) {
        //             var fixtureId = sheetData.data[row][0][0];
        //             var fixtureAndChannelId = fixtureId.split(':');
        //             if (fixtureAndChannelId[0]) {
        //                 fixtureIdRequestString.push(fixtureAndChannelId[0]);
        //             }
        //         }
        //     }

        //     this.onItemSelected({ ids: fixtureIdRequestString });

        //     this.m_selectedRows.length = 0;
        // }

        // // Send select column command
        // if ((0 <= this.m_selectedHeaderColumn) && ((this.m_selectedHeaderColumn - this.m_containerOffset.x) < sheetData.cols.length)) {
        //     var attributeId = sheetData.cols[this.m_selectedHeaderColumn - this.m_containerOffset.x].id;
        //     this.onItemSelected({ ids: attributeId, attribute: true });
        //     this.m_selectedHeaderColumn = -1;
        // }

        this.draw(sheetData);
        this.drawScrollBars();
    };
    ExecutorSheetWindow.prototype.draw = function (sheetData) {
        var columnsCount = Math.min(this.GetVisibleColsCount() + 1 + this.m_defaultSettings.fixedColumnsCount, this.m_filteredColumns.length);

        var rows = sheetData.rows;
        var selectedCellData = 0;

        var activeCues = {
            rowStart: undefined,
            rowEnd: undefined
        };

        var offsetX = 0;
        var curActiveRows = [];

        if (rows) {
            for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                var row = rows[rowIndex].cells;
                var rowProperties = rows[rowIndex].prop;
                if (rowProperties && rowProperties.s) {
                    if(activeCues.rowStart == undefined) {
                        activeCues.rowStart = rowIndex;
                    }
                    activeCues.rowEnd = rowIndex;
                }
                offsetX = 0;
                for (var col = -this.m_defaultSettings.fixedColumnsCount; col < this.m_containerOffset.x + columnsCount; col++) {
                    if (col == 0) {
                        col = this.m_containerOffset.x;
                    }

                    var index = col + this.m_defaultSettings.fixedColumnsCount;
                    var column = this.m_filteredColumns[index];
                    if (!column) {
                        continue;
                    }

                    var item_data = row[column.id] || {};

                    var offset = (col < this.m_containerOffset.x) ? 0 : this.m_containerOffset.x;
                    var colWidth = this.getColumnWidth(index - offset);

                    var text = item_data.v;
                    if ((column.n == "Number") && (activeCues.rowStart !== undefined) && (activeCues.rowStart <= rowIndex) && (rowIndex <= activeCues.rowEnd) ) {
                        curActiveRows.push({ rowNumber: parseInt(text), rowIndex: rowIndex });
                    }
                    if ((column.n != "Name") && (item_data.pgs)) {
                        text = Math.floor(item_data.pgs) + "";
                    };

                    var cellData = {
                        offsetX: offsetX,
                        row: rowIndex + 1,
                        cellWidth: colWidth,
                        text: text,
                        textColor: item_data.c || sheetData.c || this.m_defaultSettings.textColor,
                        cellBackgroundColor: item_data.bC || sheetData.bC || remoteColors.executorSheet.cellBackgroundColor,
                        progressColor: item_data.pgsC,
                        progressValue: item_data.pgs,
                        progressPercent: item_data.pgsProc,
                        inverted: item_data.inv
                    };
                    cellData.borderColor = cellData.cellBackgroundColor != this.m_defaultSettings.cellStrokeStyle ? this.m_defaultSettings.cellStrokeStyle : this.m_defaultSettings.cellStrokeStyleAlternative;

                    if ((col == offset + this.m_focusPos.x) && (rowIndex == this.m_focusPos.y)) {
                        selectedCellData = cellData;
                    } else {
                        this.drawCell(cellData);
                    }
                    offsetX += colWidth;
                }
            }
        }

        offsetX = 0;
        for (var col = -this.m_defaultSettings.fixedColumnsCount; col < this.m_containerOffset.x + columnsCount; col++) {
            if (col == 0) {
                col = this.m_containerOffset.x;
            }
            var index = col + this.m_defaultSettings.fixedColumnsCount;
            var column = this.m_filteredColumns[index];
            if (!column) {
                continue;
            }

            var offset = (col < this.m_containerOffset.x) ? 0 : this.m_containerOffset.x;
            var colWidth = this.getColumnWidth(index - offset);

            var title = $.normalizeConsoleString(column ? column.n : "");
            var textColor = this.m_defaultSettings.textColor;
            if (column.sAtt) {
                textColor = this.m_defaultSettings.headerSelectedAttributeColor;
            } else if (column.sPre) {
                textColor = this.m_defaultSettings.headerSelectedPresetColor;
            }
            this.drawCell({
                isTitle: true,
                offsetX: offsetX,
                row: 0,
                cellWidth: colWidth,
                text: title,
                textColor: textColor,
                cellBackgroundColor: this.m_defaultSettings.headerCellBackgroundColor,
                borderColor: this.m_defaultSettings.headerCellStrokeStyle
            });
            offsetX += colWidth;
        }

        if (activeCues.rowStart !== undefined) {
            this.renderer.drawRect({x: 0, y: (activeCues.rowStart + this.m_defaultSettings.titleRows)*this.m_containerSettings.cellRenderHeight, width: offsetX, height: (activeCues.rowEnd - activeCues.rowStart + this.m_defaultSettings.titleRows)*this.m_containerSettings.cellRenderHeight}, remoteColors.executorSheet.selectedBorderColor, this.m_defaultSettings.frameSize);
        }

        if (selectedCellData) {
            selectedCellData.borderColor = this.m_defaultSettings.focusCellBorderColor;
            this.drawCell(selectedCellData);
        }
    };
    ExecutorSheetWindow.prototype.getColumnWidth = function (colIndex) {
        if (colIndex < this.m_defaultSettings.fixedColumnsCount) {
            if ((colIndex < 0) || (this.m_containerSettings.columnWidth.length <= colIndex)) {
                window.generic.statusLogging("getColumnWidth invalid argument " + colIndex);
                return 0;
            }

            return this.m_containerSettings.columnWidth[colIndex];
        }

        if ((colIndex + this.m_containerOffset.x < 0) || (this.m_containerSettings.columnWidth.length <= (colIndex + this.m_containerOffset.x))) {
            window.generic.statusLogging("getColumnWidth invalid argument " + colIndex);
            return 0;
        }

        return this.m_containerSettings.columnWidth[colIndex + this.m_containerOffset.x];
    };
    ExecutorSheetWindow.prototype.drawCell = function (cellData){
        var contentRect = this.GetContentRect();
        var x = contentRect.left + cellData.offsetX;
        var y = contentRect.top + (cellData.row * this.m_containerSettings.cellRenderHeight);

        var cellRect = {
            x: x,
            y: y,
            width: cellData.cellWidth,
            height: this.m_containerSettings.cellRenderHeight
        };

        this.renderer.drawRect(
            cellRect,
            cellData.borderColor,
            this.m_defaultSettings.frameSize,
            cellData.cellBackgroundColor
        );

        if (cellData.progressColor) {
            var rectWidth = cellRect.width * cellData.progressPercent;
            var progressRect = {
                x: cellRect.x,
                y: cellRect.y,
                width: rectWidth,
                height: cellRect.height
            };
            if (cellData.inverted) {
                progressRect.x = cellRect.x + cellRect.width - progressRect.width;
            }
            this.renderer.drawRect(
                progressRect,
                null,
                0,
                cellData.progressColor
            );
        }

        var innerRect = {
            x: cellRect.x + this.m_defaultSettings.frameSize,
            y: cellRect.y + this.m_defaultSettings.frameSize,
            width: cellRect.width - 2 * this.m_defaultSettings.frameSize,
            height: cellRect.height - 2 * this.m_defaultSettings.frameSize
        };

        this.renderer.fillText(
            innerRect,
            cellData.text,
            { family: this.m_defaultSettings.fontFamily, size: this.m_defaultSettings.cellFontSize},
            cellData.textColor,
            cellData.isTitle ? "center" : "left",
            "middle",
            true
        );
    };
    ExecutorSheetWindow.prototype.stretch = function () {
        var contentRect = this.GetContentRect();

        var rowsCount = parseInt(contentRect.height / this.m_containerSettings.cellHeight);
        var unusedSpaceHeight = contentRect.height - rowsCount * this.m_containerSettings.cellHeight;
        this.m_containerSettings.cellRenderHeight = this.m_containerSettings.cellHeight + unusedSpaceHeight / rowsCount;
    }
    ExecutorSheetWindow.prototype.SelectRange = function (selectionSize, point, hDirection, vDirection) {
        if (selectionSize) {
            if (this.m_containerSettings.cellRenderHeight <= 0) {
                return;
            }
            var firstSelectedRow = Math.ceil(selectionSize.startY / this.m_containerSettings.cellRenderHeight) - 2;
            var lastSelectedRow = Math.ceil(selectionSize.endY / this.m_containerSettings.cellRenderHeight) - 2;
            if (firstSelectedRow > lastSelectedRow) {
                var tmp = firstSelectedRow;
                firstSelectedRow = lastSelectedRow;
                lastSelectedRow = tmp;
            }

            //window.generic.statusLogging("Selected rows between: " + firstSelectedRow + " and " + lastSelectedRow);

            this.m_selectedRows.length = 0;

            if (vDirection == window.uiTypes.VerticalDirection.BottomToTop) {
                for (var i = lastSelectedRow; i >= firstSelectedRow; --i) {
                    if (0 <= i && i < this.GetRowsCount()) {
                        this.m_selectedRows.push(i);
                    }
                }
            } else {
                for (var i = firstSelectedRow; i <= lastSelectedRow; ++i) {
                    if (0 <= i && i < this.GetRowsCount()) {
                        this.m_selectedRows.push(i);
                    }
                }
            }
        }

        var selectedCell = this.GetCellIndicesFromPoint(point);
        //window.generic.statusLogging("selectedCell.row: " + selectedCell.row);
        this.m_selectedHeaderColumn = (selectedCell.row == -1) && (selectedCell.col >= 0) ? selectedCell.col : -1;

        //window.generic.statusLogging("selected header column: " + this.m_selectedHeaderColumn);
    };

    ExecutorSheetWindow.prototype.hasColumns = function() {
        return !!this.m_columns;
    };

    ExecutorSheetWindow.prototype.setFilter = function(filter,name) {
        this.m_filter  = filter;
        this.m_filterName = name;
    };

    ns.ExecutorSheetWindow = ExecutorSheetWindow;
})(window.uiTypes.canvas);
