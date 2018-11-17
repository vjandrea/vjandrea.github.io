window.uiTypes.pages.FixtureSheet = (function () {
    var PageBase = window.uiTypes.pages.Page;

    var FixtureSheet = function(commandLine, commandExecutor, globalSettings) {
        FixtureSheet.superclass.constructor.call(this, $.createItem({ class:"canvas-container", html: "<div><canvas>Sorry, your browser is not supported.</canvas></div>"}), commandLine, commandExecutor, globalSettings);

        $.extend(this.m_defaultSettings, {
        });

        this.m_commandLine = commandLine;
        this.m_commandExecutor = commandExecutor;

        this.itemSelected_context = this.ItemSelected.bind(this);
    };
    window.generic.extend(FixtureSheet, window.uiTypes.pages.CanvasPage);
    FixtureSheet.prototype.CreateWindow = function () {
        this.m_ma2window = new window.uiTypes.canvas.FixtureSheetWindow(this.canvas, window.CanvasRenderer(this.canvas[0].getContext("2d")), { top: 0, left: 0, width: this.canvas[0].width, height: this.canvas[0].height });
        this.m_ma2window.init();
        $(this.m_ma2window).bind(this.m_ma2window.itemSelectedEvent, this.itemSelected_context);
        DataHandlerManager.Register({ name: this.id + "DataHandler", handler: this.m_ma2window.SetDataSource.bind(this.m_ma2window) });
        $(this).triggerHandler(PageBase.events.pageButtonsChanged, { buttons: this.CreatePageButtons() });
    };

    FixtureSheet.prototype.CreatePageButtons = function() {
        if(!this.pageButtons){
            var getCommandState = this.m_ma2window.GetCommandState.bind(this.m_ma2window);
            var setCommandState = this.m_ma2window.SetCommandState.bind(this.m_ma2window);

            var progOnlyHandler = (function(command, eventType){
                commands.defaultCommandHandler(command, eventType);
                this.m_ma2window.ResetFocusAndOffset();
            }).bind(this);

            if(isDot2())
            {
                this.pageButtons = [
                    { command: commands.StateCommand(commands.CommandType.presetValue, commands.ui.defaultCommandExecute, getCommandState, setCommandState), uiElement: commands.ui.UIStateImageButton(), icon:"images/btncontext.png" },
                    { command: commands.Commands.high(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.clear(), uiElement: commands.ui.UIMultiStateButton() },
                ];
            }
            else
            {
                this.pageButtons = [
                    { command: commands.StateCommand(commands.CommandType.presetValue, commands.ui.defaultCommandExecute, getCommandState, setCommandState), uiElement: commands.ui.UIDropDown() },
                    { command: commands.StateCommand(commands.CommandType.progOnly, progOnlyHandler), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.StateCommand(commands.CommandType.featureSort, commands.ui.defaultCommandExecute, getCommandState, setCommandState), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.StateCommand(commands.CommandType.fixtureSort, commands.ui.defaultCommandExecute, getCommandState, setCommandState), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.high(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.clear(), uiElement: commands.ui.UIMultiStateButton() },
                ];
            }
            this.pageButtons.forEach(commands.ui.initCommandUIElementPair);
            generic.globs.serverCommandManager.addCommands(this.id, this.pageButtons);
        }
        return this.pageButtons;
    };

    FixtureSheet.prototype.GetPayloadObject = function () {
        var payload = FixtureSheet.superclass.GetPayloadObject.call(this);
        payload.requestType = Server.requestTypes.fixtureSheet;
        payload.cntCols = this.m_ma2window.GetVisibleColsCount() + 1;
        payload.cntRows = this.m_ma2window.GetVisibleRowsCount();
        payload.offCol = this.m_ma2window.GetDataOffsetX();
        payload.offRow = this.m_ma2window.GetDataOffsetY();
        payload.layerMode = this.m_ma2window.GetCommandState(commands.CommandType.presetValue).value;
        payload.sortFea = this.m_ma2window.GetCommandState(commands.CommandType.featureSort).value ? "1" : "0";
        payload.sortFix = this.m_ma2window.GetCommandState(commands.CommandType.fixtureSort).value ? "1" : "0";
        return payload;
    };
    FixtureSheet.prototype.ItemSelected = function (event, args) {
        var ids = (args.ids instanceof Array) ? args.ids.join("+") : args.ids;

        var command = !args.attribute ? "fixture" : "attribute";
        this.m_commandExecutor.send({ command: command + " " + ids });

        // m_commandExecutor.send({
        //     event_type: "select_fixture",
        //     ids: ids
        // });
    };
    FixtureSheet.prototype.Close = function () {
        $(this.m_ma2window).unbind(this.m_ma2window.itemSelectedEvent, this.itemSelected_context);

        FixtureSheet.superclass.Close.call(this);
    };
    FixtureSheet.id = "fixtureSheet";
    FixtureSheet.title = "Fixture Sheet";
    FixtureSheet.content = '<div id="' + FixtureSheet.id + '"></div>';

    return FixtureSheet;
})();

window.uiTypes.canvas.FixtureSheetWindow = (function(){
    var FixtureSheetWindow = function(parentElement, renderer, rect) {
        FixtureSheetWindow.superclass.constructor.call(this, parentElement, renderer, rect);

        $.extend(this.m_defaultSettings, {
            fontSizeToCellHeightCoef: 5 / 3,
            fontSizeToCellWidthCoef: 20 / 3,
            headerCellBackgroundColor: remoteColors.fixtureSheet.headerCellBackgroundColor,
            cellBackgroundColor: remoteColors.fixtureSheet.cellBackgroundColor,
            cellBackgroundColor2: remoteColors.fixtureSheet.cellBackgroundColor2,
            headerSelectedAttributeColor: remoteColors.fixtureSheet.headerSelectedAttributeColor,
            headerSelectedPresetColor: remoteColors.fixtureSheet.headerSelectedPresetColor,

            hScrollVisible: true,
            vScrollVisible: true,

            fixedColumnsCount: 2,
            titleRows: 1,

            storage: Storage.AddSection("FixtureSheet")
        });

        if(isDot2())
        {
            this.m_defaultSettings.cellStrokeStyle = remoteColors.fixtureSheet.borderColor;
            this.m_defaultSettings.focusCellBorderColor = remoteColors.fixtureSheet.focusBorderColor
        }

        this.m_selectedRows = [];
        this.m_selectedHeaderColumn = -1;

        this.init = function () {
            FixtureSheetWindow.superclass.init.call(this);

            var offset = this.m_defaultSettings.storage.Load("offset", {x:0,y:0});
            var focus = this.m_defaultSettings.storage.Load("focus", {x:0,y:0});
            this.setOffset(offset);
            this.setFocus(focus);

            this.m_redrawWholeCanvas = true;
        }

        //#region Drawing
        this.SetDataSource = function (consolereturn) {
            if (!consolereturn || (consolereturn.responseType != Server.requestTypes.fixtureSheet)) {
                return false;
            }

            var fixturesheet = consolereturn;
            var totalCols = fixturesheet.cntCols;
            var totalRows = fixturesheet.cntRows;

            if ((totalCols === undefined) || (totalRows === undefined)) {
                return false;
            }

            this.SetColsCount(totalCols);
            this.SetRowsCount(totalRows);

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
            for (var i = 0; i < fixturesheet.cntCols; i++) {
                columnWidthArray[i] = this.m_containerSettings.cellWidth;
            }
            if (columnWidthArray.length > 0) {
                columnWidthArray[0] = this.m_containerSettings.cellWidth / 2;
            }
            this.m_containerSettings.columnWidth = columnWidthArray;
            this.m_redrawWholeCanvas = true;

            this.refresh(fixturesheet);

            return true;
        }
        this.refresh = function (fixturesheet) {
            FixtureSheetWindow.superclass.refresh.call(this);

            if (!fixturesheet) {
                return;
            }

            this.Stretch();

            // Send select fixture command
            if (this.m_selectedRows.length > 0) {
                var fixtureIdRequestString = [];

                for (var i = 0; i < this.m_selectedRows.length; ++i) {
                    var row = this.m_selectedRows[i];
                    if ((0 <= row) && (row < fixturesheet.data.length)) {
                        var fixtureId = fixturesheet.data[row][0][0];
                        var fixtureAndChannelId = fixtureId.split(':');
                        if (fixtureAndChannelId[0]) {
                            fixtureIdRequestString.push(fixtureAndChannelId[0]);
                        }
                    }
                }

                this.onItemSelected({ ids: fixtureIdRequestString });

                this.m_selectedRows.length = 0;
            }

            // Send select column command
            if ((0 <= this.m_selectedHeaderColumn) && ((this.m_selectedHeaderColumn - this.m_containerOffset.x) < fixturesheet.cols.length)) {
                var attributeId = fixturesheet.cols[this.m_selectedHeaderColumn - this.m_containerOffset.x].id;
                this.onItemSelected({ ids: attributeId, attribute: true });
                this.m_selectedHeaderColumn = -1;
            }

            this.draw(fixturesheet);
            this.drawScrollBars();
        }

        this.draw = function (fixturesheet) {
            var columns = fixturesheet.cols;
            var columnsCount = Math.min(this.GetVisibleColsCount() + 1 + this.m_defaultSettings.fixedColumnsCount, columns.length);
            if (this.m_redrawWholeCanvas) {
                var offsetX = 0;
                for (var col = 0; col < columnsCount; col++) {
                    var colWidth = this.getColumnWidth(col);
                    var text = columns[col] ? columns[col].n : "";
                    var textColor = this.m_defaultSettings.textColor;
                    if (columns[col].sAtt) {
                        textColor = this.m_defaultSettings.headerSelectedAttributeColor;
                    } else if (columns[col].sPre) {
                        textColor = this.m_defaultSettings.headerSelectedPresetColor;
                    }
                    if(isDot2())
                    {
                        this.drawCell({
                            offsetX: offsetX,
                            row: 0,
                            cellWidth: colWidth,
                            text: text,
                            textColor: textColor,
                            cellBackgroundColor: this.m_defaultSettings.headerCellBackgroundColor
                        });
                    }
                    else
                    {
                        this.drawCell({
                            offsetX: offsetX,
                            row: 0,
                            cellWidth: colWidth,
                            text: text,
                            textColor: textColor,
                            cellBackgroundColor: this.m_defaultSettings.cellBackgroundColor
                        });
                    }
                    offsetX += colWidth;
                }
                this.m_redrawWholeCanvas = false;
            }

            var data = fixturesheet.data;
            var n_rows = data.length;

            var selectedCellData = 0;
            var offsetX = 0;

            for (var row = 0; row < n_rows; row++) {
                var row_data = data[row];
                var n_cols = columnsCount; //row_data.length;
                offsetX = 0;
                for (var col = 0; col < n_cols; col++) {
                    var item_data = row_data[col];
                    var colWidth = this.getColumnWidth(col);
                    var bgColor;
                    if(isDot2())
                    {
                        if(row % 2 == 0)
                        {
                            bgColor = this.m_defaultSettings.cellBackgroundColor;
                        }
                        else
                        {
                            bgColor = this.m_defaultSettings.cellBackgroundColor2;
                        }
                    }
                    else
                    {
                        bgColor = this.m_defaultSettings.cellBackgroundColor;
                    }
                    var textColor = this.m_defaultSettings.textColor;
                    var text = "";
                    if (item_data) {
                        if (item_data[0]) {
                            text = item_data[0];
                            if(isDot2() && col == 0)
                            {
                                text = text.substr(0,text.length-1); //Remove :
                            }
                        }
                        if (item_data[1]) {
                            textColor = item_data[1];
                        }
                        if (item_data[2]) {
                            bgColor = item_data[2];
                        }
                    }

                    var cellData = {
                        offsetX: offsetX,
                        col: col,
                        row: row + 1,
                        cellWidth: colWidth,
                        text: text,
                        textColor: textColor,
                        cellBackgroundColor: bgColor
                    };

                    if (col == this.m_focusPos.x + this.m_defaultSettings.fixedColumnsCount && row == this.m_focusPos.y) {
                        selectedCellData = cellData;
                    } else {
                        this.drawCell(cellData);
                    }
                    offsetX += colWidth;
                }
            }
            if (selectedCellData) {
                selectedCellData.borderColor = this.m_defaultSettings.focusCellBorderColor;
                this.drawCell(selectedCellData);
            }
        }

        this.getColumnWidth = function (colIndex) {

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
        }

        this.drawCell = function (cellData){
            var emptyCell = !cellData.text;
            var contentRect = this.GetContentRect();
            var x = contentRect.left + cellData.offsetX;
            var y = contentRect.top + (cellData.row * this.m_containerSettings.cellRenderHeight);

            var cellRect = {
                x: x,
                y: y,
                width: cellData.cellWidth,
                height: this.m_containerSettings.cellRenderHeight
            };

            if(isDot2())
            {
                this.renderer.drawRect(
                    cellRect,
                    cellData.borderColor || this.m_defaultSettings.cellStrokeStyle,
                    this.m_defaultSettings.frameSize,
                    cellData.cellBackgroundColor
                );
            }
            else
            {
                this.renderer.drawRect(
                    cellRect,
                    cellData.borderColor || this.m_defaultSettings.cellStrokeStyle,
                    this.m_defaultSettings.frameSize,
                    !emptyCell ? cellData.cellBackgroundColor : 0
                );
            }

            var innerRect = {
                x: cellRect.x + this.m_defaultSettings.frameSize,
                y: cellRect.y + this.m_defaultSettings.frameSize,
                width: cellRect.width - 2 * this.m_defaultSettings.frameSize,
                height: cellRect.height - 2 * this.m_defaultSettings.frameSize
            };

            var alignment = "center";
            if(isDot2())
            {
                if(cellData.col == 1)
                {
                    alignment = "left";
                }
            }
            else
            {
                if((cellData.col == 0) || (cellData.col == 1))
                {
                    alignment = "left";
                }
            }

            this.renderer.fillText(
                innerRect,
                cellData.text,
                { family: this.m_defaultSettings.fontFamily, size: this.m_defaultSettings.cellFontSize},
                cellData.textColor,
                alignment,
                "middle",
                true
            );
        }
        //#endregion
        this.Stretch = function () {
            var contentRect = this.GetContentRect();

            var rowsCount = parseInt(contentRect.height / this.m_containerSettings.cellHeight);
            var unusedSpaceHeight = contentRect.height - rowsCount * this.m_containerSettings.cellHeight;
            this.m_containerSettings.cellRenderHeight = this.m_containerSettings.cellHeight + unusedSpaceHeight / rowsCount;
        }
    }
    window.generic.extend(FixtureSheetWindow, window.uiTypes.canvas.CanvasGrid);
    FixtureSheetWindow.prototype.SelectRange = function (selectionSize, point, hDirection, vDirection) {
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
        this.m_selectedHeaderColumn = (selectedCell.row == -1) && (selectedCell.col >= 0) ? selectedCell.col : -1;

        //window.generic.statusLogging("selectedCell.row: " + selectedCell.row);
        //window.generic.statusLogging("selected header column: " + this.m_selectedHeaderColumn);
    };

    return FixtureSheetWindow;
})();
