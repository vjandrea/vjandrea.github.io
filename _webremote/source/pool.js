window.uiTypes.canvas.PoolWindow = (function(){
    var PoolWindow = function(parentElement, renderer, rect, cellClass) {
        PoolWindow.superclass.constructor.call(this, parentElement, renderer, rect);

        $.extend(this.m_defaultSettings, {
            fontSizeToCellHeightCoef: 4.5,
            fontSizeToCellWidthCoef: 4.5 * 1.2,
            cellBackgroundColor: remoteColors.pools.cell.backgroundColor,
            lassoEnabled: false,
            hScrollVisible: false,
            vScrollVisible: true,

            fixedColumnsCount: 0,
            titleRows: 0
        });

        this.m_selectedItem = -1;

        this.cellObject = new cellClass(renderer);
    }
    window.generic.extend(PoolWindow, window.uiTypes.canvas.CanvasBlockBox);
    PoolWindow.prototype.init = function () {
        PoolWindow.superclass.init.call(this);

        this.SetColsCount(this.GetVisibleColsCount());
        var offset = this.m_defaultSettings.storage.Load("offset", { x: 0, y: 0 });
        var focus = this.m_defaultSettings.storage.Load("focus", { x: 0, y: 0 });
        this.setOffset(offset);
        this.setFocus(focus);
    };
    PoolWindow.prototype.refresh = function (pool) {
        PoolWindow.superclass.refresh.call(this, pool);
        if (!pool) {
            return;
        }

        this.Stretch();

        // Send select group command
        if (this.m_selectedItem >= 0) {
            this.onItemSelected({ id: this.m_selectedItem });
            this.m_selectedItem = -1;
        }

        this.draw(pool);

        this.drawScrollBars();
    };
    PoolWindow.prototype.draw = function (pool) {
        var data = pool.data;
        var actualItemsCount = this.GetItemsCount();
        var maxCols = this.GetVisibleColsCount();
        var n_items = maxCols * this.GetVisibleRowsCount();
        var selectedCellData = 0;

        var currentFocusPos = this.GetFocus();

        var rowIndex = 0;
        var colIndex = 0;
        for (var i = 0; i < n_items; i++) {
            var cell = {
                x: this.m_rect.left + colIndex * this.m_containerSettings.cellRenderWidth,
                y: this.m_rect.top + rowIndex * this.m_containerSettings.cellRenderHeight
            };

            var itemToRender = data ? (data[i] || {}) : {};
            if (!itemToRender.i) {
                itemToRender.i = i + 1 + this.m_containerOffset.y * maxCols;
            }
            if (pool.maxCnt && (itemToRender.i > pool.maxCnt)) {
                break;
            }
            cell.data = this.getItem(pool, itemToRender);
            cell.width = this.m_containerSettings.cellRenderWidth;
            cell.height = this.m_containerSettings.cellRenderHeight;
            cell.pixelPerEm = this.m_defaultSettings.pixelPerEm;

            if ((colIndex == currentFocusPos.x) && (rowIndex == currentFocusPos.y)) {
                selectedCellData = cell;
                selectedCellData.data.focusCellBorderColor = this.m_defaultSettings.focusCellBorderColor;
            } else {
                this.cellObject.draw(cell);
            }

            ++colIndex;
            if (colIndex >= maxCols) {
                colIndex = 0;
                ++rowIndex;
            }

        }
        if (selectedCellData) {
            this.cellObject.draw(selectedCellData, true);
        }
    };
    PoolWindow.prototype.SetDataSource = function (consolereturn) {
        var itemsCount = consolereturn.cnt;
        if(!consolereturn.maxCnt && isDot2())
        {
            consolereturn.maxCnt = 999;
        }
        var colsCount = this.GetVisibleColsCount();
        if (colsCount) {
            var emptyItemsCount = (colsCount - (itemsCount % colsCount)) % colsCount;
            if (this.m_defaultSettings.minEmptyItems > emptyItemsCount) {
                emptyItemsCount += Math.ceil((this.m_defaultSettings.minEmptyItems - emptyItemsCount) / colsCount) * colsCount;
            }
            itemsCount += emptyItemsCount;
            if (consolereturn.maxCnt) {
                itemsCount = Math.min(consolereturn.maxCnt, itemsCount);
            }
        }

        this.SetItemsCount(itemsCount);

        var rowsCount = this.GetRowsCount();
        if(this.m_containerOffset.y > rowsCount)
        {
            var vRowsCount = this.GetVisibleRowsCount();
            this.m_containerOffset.y = rowsCount-vRowsCount;
        }

        this.refresh(consolereturn);
        return true;
    }
    PoolWindow.prototype.hitTest = function (point, event) {
        var result = window.uiTypes.canvas.CanvasContainerWindow.superclass.hitTest.call(this, point, event);
        if (result && event.down) {
            if (event.down) {
                var selectedCell = this.GetCellIndicesFromPoint(point);
                this.setFocus({ x: selectedCell.col - this.m_defaultSettings.fixedColumnsCount - this.m_containerOffset.x, y: selectedCell.row - this.m_containerOffset.y });

                this.m_selectedItem = selectedCell.row * this.GetVisibleColsCount() + selectedCell.col + 1;
                //window.generic.statusLogging("focus: x=" + this.m_focusPos.x + ", y=" + this.m_focusPos.y);
            }
        }
    }
    PoolWindow.prototype.getItem = function (poolData, itemData) {
        return {
            text: itemData.t,
            index: itemData.i,
            borderColor: itemData.bdC || poolData.bdC,
            color: itemData.c || poolData.c
        };
    }

    PoolWindow.prototype.selectItem = utilities.emptyFunction;

    PoolWindow.prototype.GetVisibleRowsCount = function () {
        return Math.floor(this.GetContentRect().height / this.m_containerSettings.cellHeight);
    }

    PoolWindow.prototype.GetRowsCount = function () {
        return Math.max(this.GetVisibleRowsCount(), PoolWindow.superclass.GetRowsCount.call(this));
    }
    PoolWindow.prototype.close = function () {
        if (this.cellObject) {
            delete this.cellObject;
            this.cellObject = null;
        }

        PoolWindow.superclass.close.call(this);
    }

    return PoolWindow;
})();
