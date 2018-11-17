window.uiTypes.canvas.CanvasContainerWindow = (function(){
    var CanvasContainerWindow = function (parentElement, renderer, rect, dispatcher) {
        CanvasContainerWindow.superclass.constructor.call(this, parentElement, renderer, rect, dispatcher);

        $.extend(this.m_defaultSettings, {
            fontSizeToCellHeightCoef: 5 / 3,
            fontSizeToCellWidthCoef: 20 / 3,

            hScrollVisible: true,
            vScrollVisible: true,

            lassoEnabled: true,
            fillStyle: remoteColors.canvasContainer.fillColor,
            textColor: remoteColors.canvasContainer.color,
            cellBackgroundColor: remoteColors.canvasContainer.cell.backgroundColor,
            cellStrokeStyle: remoteColors.canvasContainer.cell.strokeColor,
            focusCellFrameSize: 2,
            focusCellBorderColor: remoteColors.canvasContainer.cell.focusBorderColor,
            fontFamily: "Helvetica",
            pixelPerEm: 0,

            cellFontSize: 0,
            fixedColumnsCount: 0,
            titleRows: 0
        });

        this.m_containerSettings = {
            cellHeight: 0,
            cellWidth: 0,

            cellRenderHeight: 0,
            cellRenderWidth: 0,

            colsCount: 0,
            rowsCount: 0
        };

        this.m_focusPos = { x: 0 - this.m_defaultSettings.fixedColumnsCount, y: 0 };
        this.m_containerOffset = { x: 0, y: 0 };

        this.m_wheelStartPoint = 0;

        this.GetLassoBorders = function () {
            var lassoBorder = this.GetContentRect();
            lassoBorder.top += this.m_containerSettings.cellRenderHeight * this.m_defaultSettings.titleRows;
            lassoBorder.height -= this.m_containerSettings.cellRenderHeight * this.m_defaultSettings.titleRows;
            return lassoBorder;
        }

        this.SetColsCount = function (value) {
            if (this.m_containerSettings.colsCount != value) {
                this.m_containerSettings.colsCount = value;
                this.SyncHOffset();
            }
        }

        //#region Scroll
        this.wheelStart = function () {
            window.generic.statusLogging("wheel Start");
            this.m_wheelStartPoint = { focusX: this.m_focusPos.x, focusY: this.m_focusPos.y, offsetX: this.m_containerOffset.x, offsetY: this.m_containerOffset.y };
            if (this.m_focusPos.x < 0) {
                this.m_wheelStartPoint.offsetX = 0;
                this.setOffset({ x: 0 });
            }
        }
        this.wheelEnd = function () {
            this.m_wheelStartPoint = 0;
        }
        this.hStep = function (direction) {
            if (direction === "forward") {
                var actualColsOnPage = Math.min(this.GetVisibleColsCount(), this.m_containerSettings.colsCount);
                if (this.m_focusPos.x < actualColsOnPage - 1) {
                    this.setFocus({ x: this.m_focusPos.x + 1 });
                } else if ((this.m_containerOffset.x + this.m_focusPos.x + this.m_defaultSettings.fixedColumnsCount) < (this.m_containerSettings.colsCount - 1)) {
                    this.setOffset({ x: this.m_containerOffset.x + 1 });
                }
            } else if (direction === "back") {
                if ((this.m_focusPos.x == 0) && (this.m_containerOffset.x > 0)) {
                    this.setOffset({ x: this.m_containerOffset.x - 1 });
                }
                else if (this.m_focusPos.x > -this.m_defaultSettings.fixedColumnsCount) {
                    this.setFocus({ x: this.m_focusPos.x - 1 });
                }
            }
        }
        this.hStepPage = function (direction) {
            if (direction === "forward") {
                return 10;
            } else if (direction === "back") {
                return -10;
            }
            return 0;
        }
        this.hWheel = function (offset) {
            //window.generic.statusLogging(offset);
            //window.generic.statusLogging("start.x: " + this.m_wheelStartPoint.focusX);
            if (!offset) {
                return;
            }

            if (offset < 0) {
                offset = parseInt(-offset * this.m_containerSettings.colsCount);
                if (this.m_wheelStartPoint.focusX >= offset) {
                    this.setFocus({ x: this.m_wheelStartPoint.focusX - offset });
                } else {
                    offset -= this.m_wheelStartPoint.focusX;
                    this.setFocus({ x: 0 });
                    if (this.m_wheelStartPoint.offsetX >= offset) {
                        this.setOffset({ x: this.m_wheelStartPoint.offsetX - offset });
                    } else {
                        offset -= this.m_wheelStartPoint.offsetX;
                        this.setOffset({ x: 0 });
                        if (this.m_defaultSettings.fixedColumnsCount >= offset) {
                            this.setFocus({ x: -offset });
                        } else {
                            this.setFocus({ x: -this.m_defaultSettings.fixedColumnsCount });
                        }
                    }
                }
            } else {
                var scrollableColsPerPage = this.GetVisibleColsCount();
                offset = parseInt(offset * this.m_containerSettings.colsCount);
                if (offset < scrollableColsPerPage - this.m_wheelStartPoint.focusX) {
                    this.setFocus({ x: this.m_wheelStartPoint.focusX + offset });
                } else {
                    offset -= scrollableColsPerPage - this.m_wheelStartPoint.focusX;
                    this.setFocus({ x: scrollableColsPerPage - 1 });
                    if (offset < this.m_containerSettings.colsCount - this.m_defaultSettings.fixedColumnsCount - scrollableColsPerPage - this.m_wheelStartPoint.offsetX) {
                        this.setOffset({ x: this.m_wheelStartPoint.offsetX + offset });
                    } else {
                        this.setOffset({ x: this.m_containerSettings.colsCount - this.m_defaultSettings.fixedColumnsCount - scrollableColsPerPage });
                    }
                }
            }
            //window.generic.statusLogging("focus.x: " + this.m_focusPos.x);
        }
        this.SyncHOffset = function () {
            var hScroll = this.GetHScroll();
            if (hScroll.GetVisible()) {
                var colsCount = this.m_containerSettings.colsCount;
                if (colsCount <= 1) {
                    hScroll.SetOffset(0);
                } else {
                    var offset = this.m_focusPos.x + this.m_defaultSettings.fixedColumnsCount + (this.m_focusPos.x >= 0 ? this.m_containerOffset.x : 0);
                    hScroll.SetOffset(offset / (colsCount - 1));
                }
            }
        }
        this.vStep = function (direction) {
            if (direction === "forward") {
                var actualRowsOnPage = Math.min(this.GetVisibleRowsCount(), this.GetRowsCount());
                if (this.m_focusPos.y < actualRowsOnPage - 1) {
                    this.setFocus({ y: this.m_focusPos.y + 1 });
                } else if (this.m_focusPos.y + this.m_containerOffset.y < this.GetRowsCount() - 1) {
                    this.setOffset({ y: this.m_containerOffset.y + 1 });
                }
            } else if (direction === "back") {
                if (this.m_focusPos.y > 0) {
                    this.setFocus({ y: this.m_focusPos.y - 1 });
                } else if (this.m_containerOffset.y > 0) {
                    this.setOffset({ y: this.m_containerOffset.y - 1 });
                }
                this.SyncVOffset();
            }
        }
        this.vStepPage = function (direction) {
            if (direction === "forward") {
                return 10;
            }
            else if (direction === "back") {
                return -10;
            }
            return 0;
        }
        this.vWheel = function (offset) {
            //window.generic.statusLogging(offset);
            //window.generic.statusLogging("start.x: " + this.m_wheelStartPoint.focusX);
            if (!offset) {
                return;
            }

            if (offset < 0) {
                offset = parseInt(-offset * this.GetRowsCount());
                if (this.m_wheelStartPoint.focusY >= offset) {
                    this.setFocus({ y: this.m_wheelStartPoint.focusY - offset });
                } else {
                    offset -= this.m_wheelStartPoint.focusY;
                    this.setFocus({ y: 0 });
                    if (this.m_wheelStartPoint.offsetY >= offset) {
                        this.setOffset({ y: this.m_wheelStartPoint.offsetY - offset });
                    } else {
                        this.setOffset({ y: 0 });
                    }
                }
            } else {
                var scrollableRowsPerPage = this.GetVisibleRowsCount();
                offset = parseInt(offset * this.GetRowsCount());
                if (offset < scrollableRowsPerPage - this.m_wheelStartPoint.focusY) {
                    this.setFocus({ y: this.m_wheelStartPoint.focusY + offset });
                } else {
                    offset -= scrollableRowsPerPage - this.m_wheelStartPoint.focusY;
                    this.setFocus({ y: scrollableRowsPerPage - 1 });
                    if (offset < this.GetRowsCount() - scrollableRowsPerPage - this.m_wheelStartPoint.offsetY) {
                        this.setOffset({ y: this.m_wheelStartPoint.offsetY + offset });
                    } else {
                        this.setOffset({ y: this.GetRowsCount() - scrollableRowsPerPage });
                    }
                }
            }
            //window.generic.statusLogging("focus.y: " + this.m_focusPos.y);
            this.SyncVOffset();
        }
        this.SyncVOffset = function () {
            var vScroll = this.GetVScroll();
            if (vScroll.GetVisible()) {
                var rowsCount = this.GetRowsCount();
                if (rowsCount <= 1) {
                    vScroll.SetOffset(0);
                } else {
                    vScroll.SetOffset((this.m_focusPos.y + this.m_containerOffset.y) / (rowsCount - 1));
                }
            }
        }
        //#endregion

        this.GetFocus = function () {
            return this.m_focusPos;
        }
        this.GetOffset = function () {
            return this.m_containerOffset;
        }

        this.ResetFocusAndOffset = function () {
            this.setFocus({ x: -this.m_defaultSettings.fixedColumnsCount, y: 0 });
            this.setOffset({ x: 0, y: 0 });
        };

        // Commands
        this.GetCommandState = function(commandType){
            var state = this.m_defaultSettings.storage.Load(commandType.id, commandType.default);
            return state.value ? state : commandType.default;
        };

        this.SetCommandState = function(commandType, newValue){
            return this.m_defaultSettings.storage.Save(commandType.id, newValue, true);
        };

        // Events
        this.itemSelectedEvent = "itemSelected";
    }
    window.generic.extend(CanvasContainerWindow, window.uiTypes.canvas.MA2Window);
    CanvasContainerWindow.prototype.init = function () {
        CanvasContainerWindow.superclass.init.call(this);

        this.SetHScrollVisible(this.m_defaultSettings.hScrollVisible);
        this.SetVScrollVisible(this.m_defaultSettings.vScrollVisible);

        this.setFontSize();

        window.generic.globs.selectionOverlay.setBorders(this.GetLassoBorders());
        window.generic.globs.selectionOverlay.setParent(this.m_parent);
    }
    CanvasContainerWindow.prototype.setFontSize = function () {
        var size = utility.getDefaultFontSize();
        this.m_defaultSettings.cellFontSize = size;
        this.m_defaultSettings.pixelPerEm = size / 1;

        this.m_containerSettings.cellHeight = parseInt(this.m_defaultSettings.cellFontSize * this.m_defaultSettings.fontSizeToCellHeightCoef);
        this.m_containerSettings.cellWidth = parseInt(this.m_defaultSettings.cellFontSize * this.m_defaultSettings.fontSizeToCellWidthCoef);

        this.m_redrawWholeCanvas = true;
    }
    CanvasContainerWindow.prototype.setFocus = function (data, forceUpdate) {
        if (!data) {
            return;
        }

        var rowChanged = (data.y != undefined) && (data.y != this.m_focusPos.y);
        if (rowChanged || forceUpdate) {
            this.m_focusPos.y = Math.max(data.y, 0);
            this.SyncVOffset();
        }

        var colChanged = (data.x != undefined) && (data.x != this.m_focusPos.x);
        if (colChanged || forceUpdate) {
            this.m_focusPos.x = Math.max(data.x, -this.m_defaultSettings.fixedColumnsCount);
            this.SyncHOffset();
        }

        if (rowChanged || colChanged) {
            this.m_defaultSettings.storage.Save("focus", this.m_focusPos);
        }
    }
    CanvasContainerWindow.prototype.setOffset = function (data, forceUpdate) {
        if (!data) {
            return;
        }

        if (data.x < 0 || data.y < 0) {
            window.generic.statusLogging("Offset is invalid (x: " + data.x + ", " + data.y + ")");
            data.x = Math.max(data.x, 0);
            data.y = Math.max(data.y, 0);
        }

        var rowChanged = (data.y != undefined) && (data.y != this.m_containerOffset.y);
        if (rowChanged || forceUpdate) {
            this.m_containerOffset.y = data.y;
            this.SyncVOffset();
        }

        var colChanged = (data.x != undefined) && (data.x != this.m_containerOffset.x);
        if (colChanged || forceUpdate) {
            this.m_containerOffset.x = data.x;
            this.SyncHOffset();
        }

        if (rowChanged || colChanged) {
            this.m_redrawWholeCanvas = true;
            this.m_defaultSettings.storage.Save("offset", this.m_containerOffset);
        }
    }
    CanvasContainerWindow.prototype.getFocusAndOffset = function () { return { focus: { x: 0, y: 0 }, offset: { x: 0, y: 0} }; }
    CanvasContainerWindow.prototype.resize = function (rect, _init) {
        CanvasContainerWindow.superclass.resize.call(this, rect, _init);

        this.SetColsCount(this.GetVisibleColsCount());

        var result = _init ? { focus: this.GetFocus(), offset: this.GetOffset() } : this.getFocusAndOffset();
        this.setFocus(result.focus, true);
        this.setOffset(result.offset, true);

        window.generic.globs.selectionOverlay.setBorders(this.GetLassoBorders());
    }
    //#region Interface to scrollbars
    CanvasContainerWindow.prototype.GetVisibleScrollableWidth = function () {
        return this.GetContentRect().width;
    }
    CanvasContainerWindow.prototype.GetVisibleScrollableHeight = function () {
        return this.GetContentRect().height - this.m_containerSettings.cellHeight * this.m_defaultSettings.titleRows; // minus scrollbar at the bottom and header
    }
    CanvasContainerWindow.prototype.GetFullScrollableHeight = function () {
        return this.GetRowsCount() * this.m_containerSettings.cellHeight;
    }
    CanvasContainerWindow.prototype.GetFullScrollableWidth = function () { return 0; }
    //#endregion
    //#region Parent class uses this
    CanvasContainerWindow.prototype.GetVisibleRowsCount = function () {
        return parseInt(this.GetContentRect().height / this.m_containerSettings.cellHeight) - this.m_defaultSettings.titleRows; // 1st Row is the Column Titles
    }
    CanvasContainerWindow.prototype.GetDataOffsetX = function () {
        return this.m_containerOffset.x + this.m_defaultSettings.fixedColumnsCount;
    }
    //#endregion
    CanvasContainerWindow.prototype.hitTest = function (point, event) {
        var result = CanvasContainerWindow.superclass.hitTest.call(this, point, event);
        if (result || event.up) {
            if (this.m_defaultSettings.lassoEnabled) {
                var contentRect = this.GetContentRect();

                var selectionSize = 0;
                if (event.down) {
                    window.generic.globs.selectionOverlay.init(point.x, point.y);
                    selectionSize = window.generic.globs.selectionOverlay.getSize();
                } else if (event.move) {
                    window.generic.globs.selectionOverlay.expand(point.x, point.y);
                    selectionSize = window.generic.globs.selectionOverlay.getSize();
                } else if (event.up) {
                    window.generic.globs.selectionOverlay.expand(point.x, point.y);
                    selectionSize = window.generic.globs.selectionOverlay.getSize();
                    window.generic.globs.selectionOverlay.Close();

                    if (selectionSize) {
                        //window.generic.statusLogging("Selection region: startX: " + selectionSize.startX + "; startY: " + selectionSize.startY + "; endX: " + selectionSize.endX + "; endY:" + selectionSize.endY);

                        selectionSize.startX -= contentRect.left;
                        selectionSize.startY -= contentRect.top;

                        selectionSize.endX -= contentRect.left;
                        selectionSize.endY -= contentRect.top;
                    }

                    this.SelectRange(selectionSize, point, window.generic.globs.selectionOverlay.getHDirection(), window.generic.globs.selectionOverlay.getVDirection());
                }

                if (selectionSize) {
                    var selectedCell = this.GetCellIndicesFromPoint({ x: selectionSize.endX, y: selectionSize.endY });
                    if ((selectedCell.row < this.GetRowsCount()) && (0 <= selectedCell.col) && (selectedCell.col < this.m_containerSettings.colsCount)) {

                        if (event.up) {
                            if (this.m_focusPos.x == this.GetVisibleColsCount()) {
                                this.setFocus({ x: this.m_focusPos.x - 1, y: this.m_focusPos.y });
                                this.setOffset({ x: this.m_containerOffset.x + 1, y: this.m_containerOffset.y });
                            } else {
                                var focusPos = {
                                    x: selectedCell.col - this.m_defaultSettings.fixedColumnsCount - this.m_containerOffset.x,
                                    y: selectedCell.row - this.m_containerOffset.y
                                };
                                if ((-this.m_defaultSettings.fixedColumnsCount <= focusPos.x) && (focusPos.x <= this.m_containerSettings.colsCount - this.m_defaultSettings.fixedColumnsCount - this.m_containerOffset.x)) {
                                    // Y-value doesn't need this check, because the grid is stretched vertically
                                    if (focusPos.y >= 0) {
                                        this.setFocus(focusPos);
                                    }
                                }
                            }
                            //window.generic.statusLogging("focus: x=" + this.m_focusPos.x + ", y=" + this.m_focusPos.y);
                        }
                    }
                }
            }
        }
        return result;
    }


    // Events
    CanvasContainerWindow.prototype.onItemSelected = function(args){
        $(this).triggerHandler(this.itemSelectedEvent, args);
    };
    return CanvasContainerWindow;
}) ();

window.uiTypes.canvas.CanvasGrid = (function(){
    var CanvasGrid = function (parentElement, renderer, rect, dispatcher) {
        CanvasGrid.superclass.constructor.call(this, parentElement, renderer, rect, dispatcher);

        $.extend(this.m_containerSettings, { columnWidth: [] });
    }
    window.generic.extend(CanvasGrid, window.uiTypes.canvas.CanvasContainerWindow);
    CanvasGrid.prototype.getFocusAndOffset = function () {
        return getFocusAndOffsetFromCellIndex(this.GetVisibleRowsCount(), this.GetVisibleColsCount(), this.GetRowsCount(), this.m_containerSettings.colsCount, this.m_containerOffset, this.m_focusPos);
    }
    var getFocusAndOffsetFromCellIndex = function(visibleRowsCount, visibleColsCount, rowsCount, colsCount, currentOffset, currentFocus) {
        var result = {
            focus: { x: 0, y: 0 },
            offset: { x: 0, y: 0 }
        };
        var selectedRow = currentOffset.y + currentFocus.y;
        window.generic.statusLogging("selectedRow: " + selectedRow);

        var maxRowOffset = Math.max(0, rowsCount - visibleRowsCount);
        window.generic.statusLogging("maxRowOffset: " + maxRowOffset);
        if (selectedRow <= maxRowOffset) {
            if ((currentOffset.y <= selectedRow) && (selectedRow <= currentOffset.y + visibleRowsCount)) {
                result.offset.y = currentOffset.y;
                result.focus.y = currentFocus.y;
            } else {
                result.offset.y = selectedRow;
                result.focus.y = 0;
            }
        } else {
            result.offset.y = maxRowOffset;
            result.focus.y = selectedRow - maxRowOffset;
        }
        window.generic.statusLogging("result.offset.y: " + result.offset.y);
        window.generic.statusLogging("result.focus.y: " + result.focus.y);


        var selectedCol = currentOffset.x + currentFocus.x;
        window.generic.statusLogging("selectedCol: " + selectedCol);
        if (selectedCol >= 0) {
            var maxColOffset = colsCount - visibleColsCount;
            window.generic.statusLogging("maxColOffset: " + maxColOffset);
            if (selectedCol <= maxColOffset) {
                if ((currentOffset.x <= selectedCol) && (selectedCol <= currentOffset.x + visibleColsCount)) {
                    result.offset.x = currentOffset.x;
                    result.focus.x = currentFocus.x;
                } else {
                    result.offset.x = selectedCol;
                    result.focus.x = 0;
                }
            } else {
                result.offset.x = maxColOffset;
                result.focus.x = selectedCol - maxColOffset;
            }
        } else {
            result.offset.x = currentOffset.x;
            result.focus.x = currentFocus.x;
        }
        window.generic.statusLogging("result.offset.x: " + result.offset.x);
        window.generic.statusLogging("result.focus.x: " + result.focus.x);

        return result;
    }
    CanvasGrid.prototype.GetFullScrollableWidth = function () {
        var result = 0;
        for (var i = 0; i < this.m_containerSettings.columnWidth.length; i++) {
            result += this.m_containerSettings.columnWidth[i];
        }
        return result;
    }
    CanvasGrid.prototype.GetMaxVisibleColsCount = function () {
        var result = 0;
        var visibleWidth = this.GetContentRect().width;
        for (var i = 0; (i < this.m_defaultSettings.fixedColumnsCount) && (i < this.m_containerSettings.columnWidth.length) ; i++) {
            visibleWidth -= this.m_containerSettings.columnWidth[i];
            if (visibleWidth < 0) {
                break;
            }
            ++result;
        }
        for (var i = this.m_defaultSettings.fixedColumnsCount + this.m_containerOffset.x; i < this.m_containerSettings.columnWidth.length; i++) {
            visibleWidth -= this.m_containerSettings.columnWidth[i];
            if (visibleWidth < 0) {
                break;
            }
            ++result;
        }

        while (visibleWidth >= this.m_containerSettings.cellWidth) {
            visibleWidth -= this.m_containerSettings.cellWidth;
            ++result;
        }

        return result;
    }
    //#region Parent class uses this
    CanvasGrid.prototype.GetVisibleColsCount = function () {
        var result = this.GetVisibleColsArray().length - this.m_defaultSettings.fixedColumnsCount;
        if (result <= 0) {
            result = this.GetMaxVisibleColsCount();
        }
        return result;
    }
    CanvasGrid.prototype.GetVisibleColsArray = function () {
        var result = [];
        var visibleWidth = this.GetContentRect().width;
        for (var i = 0; (i < this.m_defaultSettings.fixedColumnsCount) && (i < this.m_containerSettings.columnWidth.length); i++) {
            visibleWidth -= this.m_containerSettings.columnWidth[i];
            if (visibleWidth < 0) {
                break;
            }
            result.push(i);
        }
        for (var i = this.m_defaultSettings.fixedColumnsCount + this.m_containerOffset.x; i < this.m_containerSettings.columnWidth.length; i++) {
            visibleWidth -= this.m_containerSettings.columnWidth[i];
            if (visibleWidth < 0) {
                break;
            }
            result.push(i);
        }

        //         window.generic.statusLogging("GetVisibleColsArray length: " + result.length);
        //         window.generic.statusLogging("GetVisibleColsArray: " + result);
        return result;
    }
    CanvasGrid.prototype.GetDataOffsetY = function () {
        return this.m_containerOffset.y;
    }
    //#endregion
    CanvasGrid.prototype.GetRowsCount = function () {
        return this.m_containerSettings.rowsCount;
    }
    CanvasGrid.prototype.SetColsCount = function (value) {
        if (this.m_containerSettings.colsCount != value) {
            this.m_containerSettings.colsCount = value;
            this.SyncHOffset();
        }
    }
    CanvasGrid.prototype.GetCellIndicesFromPoint = function (point) {
        var result = { col: -1, row: -1 };
        var contentRect = this.GetContentRect();

        result.row = Math.ceil((point.y - contentRect.top) / this.m_containerSettings.cellRenderHeight) - this.m_defaultSettings.titleRows - 1;
        if (result.row >= 0) {
            result.row += this.m_containerOffset.y;
        } else if (result.row >= Math.min(this.GetVisibleRowsCount(), this.GetRowsCount())) {
            return false;
        }

        var visibleColsArray = this.GetVisibleColsArray();
        var clickX = (point.x - contentRect.left);
        for (var i = 0; i < visibleColsArray.length; i++) {
            clickX -= this.m_containerSettings.columnWidth[visibleColsArray[i]];
            if (clickX <= 0) {
                result.col = visibleColsArray[i];
                break;
            }
        }

        if ((clickX > 0) && (this.m_containerOffset.x + visibleColsArray.length < this.m_containerSettings.colsCount)) {
            result.col = visibleColsArray[visibleColsArray.length - 1] + 1;
        }

        return result;
    }
    CanvasGrid.prototype.SetRowsCount = function (value) {
        if (this.m_containerSettings.rowsCount != value) {
            this.m_containerSettings.rowsCount = value;
            this.SyncVOffset();
        }
    }

    return CanvasGrid;
})();

window.uiTypes.canvas.CanvasBlockBox = (function(){
    var CanvasBlockBox = function(parentElement, renderer, rect) {
        CanvasBlockBox.superclass.constructor.call(this, parentElement, renderer, rect);

        this.m_selectedItemIndex = 0;

        $.extend(this.m_containerSettings, { itemsCount: 0 });

        this.Stretch = function () {
            var contentRect = this.GetContentRect();

            var columnsCount = parseInt(contentRect.width / this.m_containerSettings.cellWidth);
            var unusedSpaceWidth = contentRect.width - columnsCount * this.m_containerSettings.cellWidth;

            var newCellRenderWidth = this.m_containerSettings.cellWidth + unusedSpaceWidth / columnsCount;

            var rowsCount = parseInt(contentRect.height / this.m_containerSettings.cellHeight);
            var unusedSpaceHeight = contentRect.height - rowsCount * this.m_containerSettings.cellHeight;
            var newCellRenderHeight = this.m_containerSettings.cellHeight + unusedSpaceHeight / rowsCount;

            var renderSizeChanged = false;
            if (this.m_containerSettings.cellRenderWidth != newCellRenderWidth) {
                this.m_containerSettings.cellRenderWidth = newCellRenderWidth;
                renderSizeChanged = true;
            }
            if (this.m_containerSettings.cellRenderHeight != newCellRenderHeight) {
                this.m_containerSettings.cellRenderHeight = newCellRenderHeight;
                renderSizeChanged = true;
            }

            if (renderSizeChanged) {
                window.generic.globs.selectionOverlay.setBorders(this.GetLassoBorders());
            }
        }
    }
    window.generic.extend(CanvasBlockBox, window.uiTypes.canvas.CanvasContainerWindow);
    CanvasBlockBox.prototype.setFocus = function (data, forceUpdate) {
        CanvasBlockBox.superclass.setFocus.call(this, data, forceUpdate);

        if (!data) {
            return;
        }

        this.m_selectedItemIndex = (this.m_focusPos.y + this.m_containerOffset.y) * this.GetVisibleColsCount() + this.m_focusPos.x;
    }
    CanvasBlockBox.prototype.setOffset = function (data, forceUpdate) {
        CanvasBlockBox.superclass.setOffset.call(this, data, forceUpdate);

        if (!data) {
            return;
        }

        this.m_selectedItemIndex = (this.m_focusPos.y + this.m_containerOffset.y) * this.GetVisibleColsCount() + this.m_focusPos.x;
    }
    CanvasBlockBox.prototype.getFocusAndOffset = function () {
        return getFocusAndOffsetFromItemIndex(this.m_selectedItemIndex, this.GetVisibleRowsCount(), this.GetVisibleColsCount(), this.GetRowsCount(), this.GetVisibleColsCount(), this.m_containerOffset);
    }
    var getFocusAndOffsetFromItemIndex = function(index, visibleRowsCount, visibleColsCount, rowsCount, colsCount, currentOffset) {
        var result = {
            focus: { x: 0, y: 0 },
            offset: { x: 0, y: 0 }
        };

        result.offset = currentOffset;
        var maxIndex = rowsCount * colsCount - 1;
        var maxVisibleIndex = visibleRowsCount * visibleColsCount - 1;
        var firstVisibleItemIndex = -1;

        if (maxIndex <= maxVisibleIndex) { // window top
            result.offset.x = 0;
            result.offset.y = 0;

            firstVisibleItemIndex = 0;
        } else if (index > maxIndex - visibleColsCount) { // window bottom
            result.offset.x = 0;
            result.offset.y = rowsCount - visibleRowsCount;

            firstVisibleItemIndex = maxIndex - visibleRowsCount * visibleColsCount + 1;
        } else {
            firstVisibleItemIndex = currentOffset.y * visibleColsCount;
            var lastVisibleItemIndex = (currentOffset.y + visibleRowsCount) * visibleColsCount - 1;
            if ((firstVisibleItemIndex <= index) && (index <= lastVisibleItemIndex)) {
                result.offset = currentOffset;
            } else {
                result.offset.y = 0;
                firstVisibleItemIndex = 0;
                lastVisibleItemIndex = visibleRowsCount * visibleColsCount - 1;
                if ((firstVisibleItemIndex > index) && (firstVisibleItemIndex >= 0)) {
                    alert("!AAA!");
                    //                 firstVisibleItemIndex -= visibleColsCount;
                    //                 lastVisibleItemIndex -= visibleColsCount;
                    //                 --result.offset.y;
                }

                while ((lastVisibleItemIndex < index) && (lastVisibleItemIndex < maxIndex)) {
                    firstVisibleItemIndex += visibleColsCount;
                    lastVisibleItemIndex += visibleColsCount;
                    ++result.offset.y;
                }
            }
        }

        result.focus.y = Math.floor((index - firstVisibleItemIndex) / visibleColsCount);
        result.focus.x = index - (result.focus.y + result.offset.y) * visibleColsCount;

        window.generic.statusLogging("result.offset.x: " + result.offset.x);
        window.generic.statusLogging("result.focus.x: " + result.focus.x);
        window.generic.statusLogging("result.offset.y: " + result.offset.y);
        window.generic.statusLogging("result.focus.y: " + result.focus.y);

        return result;
    }
    CanvasBlockBox.prototype.GetFullScrollableWidth = function () {
        return this.GetVisibleScrollableWidth();
    }
    CanvasBlockBox.prototype.GetVisibleRowsCount = function () {
        return Math.min(Math.floor(this.GetContentRect().height / this.m_containerSettings.cellHeight), Math.ceil(this.GetItemsCount() / this.GetVisibleColsCount())); // -this.m_defaultSettings.titleRows; // 1st Row is the Column Titles
    }
    //#region Parent class uses this
    CanvasBlockBox.prototype.GetVisibleColsCount = function () {
        return parseInt(this.GetContentRect().width / this.m_containerSettings.cellWidth) - this.m_defaultSettings.fixedColumnsCount;
    }
    CanvasBlockBox.prototype.GetVisibleItemsCount = function () {
        return this.GetVisibleColsCount() * this.GetVisibleRowsCount();
    }
    CanvasBlockBox.prototype.GetDataOffsetY = function () {
        return this.m_containerOffset.y * this.GetVisibleColsCount();
    }
    //#endregion

    CanvasBlockBox.prototype.GetRowsCount = function () {
        return Math.ceil(this.m_containerSettings.itemsCount / this.GetVisibleColsCount());
    }
    CanvasBlockBox.prototype.GetItemsCount = function () {
        return this.m_containerSettings.itemsCount;
    }
    CanvasBlockBox.prototype.SetItemsCount = function (value) {
        this.m_containerSettings.itemsCount = value;

        this.SyncVOffset();
    }
    CanvasBlockBox.prototype.GetCellIndicesFromPoint = function (point) {
        var result = { col: -1, row: -1 };
        var contentRect = this.GetContentRect();

        result.row = Math.ceil((point.y - contentRect.top) / this.m_containerSettings.cellRenderHeight) - this.m_defaultSettings.titleRows - 1 + this.m_containerOffset.y;

        // TODO: optimize!!!
        var clickX = (point.x - contentRect.left);
        for (var i = 0; i < this.GetVisibleColsCount(); i++) {
            clickX -= this.m_containerSettings.cellRenderWidth;
            if (clickX <= 0) { result.col = i; break; }
        }

        return result;
    }

    return CanvasBlockBox;
})();
