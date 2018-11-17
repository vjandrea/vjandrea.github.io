defineNamespace(window, "uiTypes.canvas");
defineNamespace(window, "uiTypes.pages");

(function(ns){
    var WorldPool = function(commandLine, commandExecutor, globalSettings) {
        WorldPool.superclass.constructor.call(this, $.createItem({ class:"canvas-container", html: "<div><canvas></canvas></div>"}), commandLine, commandExecutor, globalSettings);
    }
    window.generic.extend(WorldPool, window.uiTypes.pages.PoolPage);

    WorldPool.prototype.GetWindowClass = function () {
        return window.uiTypes.canvas.WorldPoolWindow;
    };

    WorldPool.prototype.ItemSelected = function (event, args) {
        var id = args.id;
        var cmdlineText = this.m_commandLine.getText();

        this.m_commandExecutor.send({
            requestType: Server.requestTypes.pool_itemSelected,
            pool: WorldPool.shortId,
            id_1: id,
            cmdlineText: cmdlineText
        });
    };
    WorldPool.id = "WorldPool";
    WorldPool.shortId = "world";
    WorldPool.title = "World Pool";
    WorldPool.content ='<div id="' + WorldPool.id + '"></div>';

    ns.WorldPool = WorldPool;
})(window.uiTypes.pages);

(function(ns){
    var WorldPoolWindow = function(parentElement, renderer, rect) {
        WorldPoolWindow.superclass.constructor.call(this, parentElement, renderer, rect, ns.WorldPoolCell);

        $.extend(this.m_defaultSettings, {
            storage: Storage.AddSection("WorldPool")
        });
    };
    window.generic.extend(WorldPoolWindow, window.uiTypes.canvas.PoolWindow);
    WorldPoolWindow.prototype.getItem = function (poolData, itemData) {
        var item = WorldPoolWindow.superclass.getItem(poolData, itemData);
        $.extend(item, {
            stateStripeColor: itemData.stateStripeC,
            maskSize: itemData.maskSize,
            mask: itemData.mask
        });
        return item;
    };
    WorldPoolWindow.prototype.SetDataSource = function (consolereturn) {
        if (consolereturn.responseType != Server.requestTypes.pool) {
            return false;
        }
        if (consolereturn.pool != "world") {
            return false;
        }

        return WorldPoolWindow.superclass.SetDataSource.call(this, consolereturn);
    };

    var WorldPoolCell = function(renderer) {
        WorldPoolCell.superclass.constructor.call(this, renderer);

        $.extend(this.m_defaultSettings, {});

        this.stateStripe.enabled = true;

        this.presetTypeMask = {
            x: 0,
            y: 0.92,
            width: 1,
            height: 0.08,
            bgColor: remoteColors.worldPool.cell.backgroundColor,
            borderWidth: 1,
            filledColor: remoteColors.worldPool.cell.filledColor,
            emptyColor: remoteColors.worldPool.cell.emptyColor
        };
    };
    window.generic.extend(WorldPoolCell, window.uiTypes.canvas.PoolCell);

    WorldPoolCell.prototype.drawPresetTypeMask = function (data) {
        var mask = data.mask;
        var maskSize = data.maskSize;

        if (!mask || !maskSize) {
            return;
        }

        var rect = this.calculateLocation(this.presetTypeMask);
        this.renderer.drawRect(rect, null, 0, this.presetTypeMask.bgColor);

        var lineWidth = rect.width / maskSize;
        var lineHeight = rect.height;
        var startX = rect.x + this.presetTypeMask.borderWidth;
        var endX = rect.x + lineWidth - this.presetTypeMask.borderWidth;
        var y = rect.y + lineHeight / 2;
        var itemLines = [[],[]];
        for (var i = 0; i < maskSize; i++) {
            var state = mask & 1;

            itemLines[state].push({
                x: startX,
                y: y
            });
            itemLines[state].push({
                x: endX,
                y: y,
                end: true
            });

            startX += lineWidth;
            endX += lineWidth;
            mask = mask >> 1;
        }

        this.renderer.drawLines(itemLines[0], this.presetTypeMask.emptyColor, null, lineHeight - 2 * this.presetTypeMask.borderWidth);
        this.renderer.drawLines(itemLines[1], this.presetTypeMask.filledColor, null, lineHeight - 2 * this.presetTypeMask.borderWidth);
    };

    WorldPoolCell.prototype.customDraw = function (cell) {
        this.drawPresetTypeMask(cell.data);
    };

    ns.WorldPoolWindow = WorldPoolWindow;
    ns.WorldPoolCell = WorldPoolCell;

})(window.uiTypes.canvas);
