defineNamespace(window, "uiTypes.canvas");
defineNamespace(window, "uiTypes.pages");

(function(ns){
    var MacroPool = function(commandLine, commandExecutor, globalSettings) {
        MacroPool.superclass.constructor.call(this, $.createItem({ class:"canvas-container", html: "<div><canvas></canvas></div>"}), commandLine, commandExecutor, globalSettings);
    };
    window.generic.extend(MacroPool, window.uiTypes.pages.PoolPage);

    MacroPool.prototype.GetWindowClass = function () {
        return window.uiTypes.canvas.MacroPoolWindow;
    };

    MacroPool.prototype.ItemSelected = function (event, args) {
        var id = args.id;
        var cmdlineText = this.m_commandLine.getText();

        this.m_commandExecutor.send({
            requestType: Server.requestTypes.pool_itemSelected,
            pool: MacroPool.shortId,
            id_1: id,
            cmdlineText: cmdlineText
        });
    };
    MacroPool.id = "MacroPool";
    MacroPool.shortId = "macro";
    MacroPool.title = "Macro Pool";
    MacroPool.content ='<div id="' + MacroPool.id + '"></div>';

    ns.MacroPool = MacroPool;
})(window.uiTypes.pages);

(function(ns){
    var MacroPoolWindow = function(parentElement, renderer, rect) {
        MacroPoolWindow.superclass.constructor.call(this, parentElement, renderer, rect, ns.MacroPoolCell);

        $.extend(this.m_defaultSettings, {
            storage: Storage.AddSection("MacroPool")
        });
    };
    window.generic.extend(MacroPoolWindow, window.uiTypes.canvas.PoolWindow);

    MacroPoolWindow.prototype.getItem = function (poolData, itemData) {
        var item = MacroPoolWindow.superclass.getItem(poolData, itemData);
        $.extend(item, {
            isReferenced: itemData.isRef,
            line: itemData.line,
            runState: itemData.runState,
            isRecording: itemData.isRecording
        });
        return item;
    };

    MacroPoolWindow.prototype.SetDataSource = function (consolereturn) {
        if (consolereturn.responseType != Server.requestTypes.pool) {
            return false;
        }
        if (consolereturn.pool != "macro") {
            return false;
        }

        return MacroPoolWindow.superclass.SetDataSource.call(this, consolereturn);
    };

    var MacroPoolCell = function(renderer) {
        MacroPoolCell.superclass.constructor.call(this, renderer);

        $.extend(this.m_defaultSettings, {

        });
    };
    window.generic.extend(MacroPoolCell, window.uiTypes.canvas.PoolCell);

    MacroPoolCell.activeMacroLine = {
        x: 0,
        y: 0.27,
        width: 1,
        height: 0.245,
        halign: "center",
        valign: "middle"
    };

    MacroPoolCell.recordingSymbol = {
        x: 0.8,
        y: 0,
        width: 0.2,
        height: 0.2
    };

    MacroPoolCell.playPauseSymbol = {
        x: 0.8,
        y: 0,
        width: 0.2,
        height: 0.2
    };

    (function prepare(){
        var prerenderedItems = {
            recordingSymbol: {
                rect: {
                    x: 0,
                    y: 0,
                    width: 20,
                    height: 20
                },
                center:{
                    x: 10,
                    y: 10
                },
                radius: 10,
                fillColor: "#A80707"
            },

            playSymbol : {
                rect: {
                    x: 20,
                    y: 0,
                    width: 20,
                    height: 20
                },
                points: [
                    { x: 20, y: 0 },
                    { x: 35, y: 10 },
                    { x: 20, y: 20 }
                ],
                color: "#F4B532",
                fillColor: "#F4B532"
            },

            pauseSymbol : {
                rect: {
                    x: 40,
                    y: 0,
                    width: 20,
                    height: 20
                },
                points: [
                    { x: 45, y: 0 },
                    { x: 45, y: 20, end: true },
                    { x: 55, y: 0 },
                    { x: 55, y: 20 }
                ],
                width: 6,
                color: "#F4B532"
            }
        };

        var canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        var context = canvas.getContext('2d');
        var renderer = window.CanvasRenderer(context);
        renderer.drawRect({x:0, y:0, width:canvas.width,height:canvas.height}, null, 0, CanvasRenderer.transparent);
        // recording symbol (0;0) -> (20;20)
        renderer.drawCircle(prerenderedItems.recordingSymbol.center, prerenderedItems.recordingSymbol.radius, null, 0, prerenderedItems.recordingSymbol.fillColor);
        // play symbol (20;0) -> (40;20)
        renderer.drawLines(prerenderedItems.playSymbol.points, prerenderedItems.playSymbol.color, prerenderedItems.playSymbol.fillColor, 1);
        // pause symbol (40;0) -> (60;20)
        renderer.drawLines(prerenderedItems.pauseSymbol.points, prerenderedItems.pauseSymbol.color, null, prerenderedItems.pauseSymbol.width);

        MacroPoolCell.offScreenCanvas = canvas;
        MacroPoolCell.prerenderedItems = prerenderedItems;
    })();

    MacroPoolCell.prototype.drawActiveMacro = function(data) {
        if (data.line) {
            var text = "Line " + data.line;
            if (text !== undefined) {
                var rect = this.calculateLocation(MacroPoolCell.activeMacroLine);
                this.renderer.fillText(rect, text, { family: this.m_defaultSettings.fontFamily }, this.m_defaultSettings.textColor, MacroPoolCell.activeMacroLine.halign, MacroPoolCell.activeMacroLine.valign);
            }
        }
    };

    MacroPoolCell.prototype.drawSymbols = function(data) {
        if (data.isRecording) {
            var rect = this.calculateLocation(MacroPoolCell.recordingSymbol);
            this.renderer.drawImage(rect, MacroPoolCell.offScreenCanvas, MacroPoolCell.prerenderedItems.recordingSymbol.rect);
        }

        if (data.runState) {
            var relativeRect = null;
            if (data.isRecording) {
                relativeRect = $.extend({}, MacroPoolCell.playPauseSymbol);
                relativeRect.x -= MacroPoolCell.recordingSymbol.width;
            } else {
                relativeRect = MacroPoolCell.playPauseSymbol;
            }
            var rect = this.calculateLocation(relativeRect);
            this.renderer.drawImage(rect, MacroPoolCell.offScreenCanvas, (data.runState == "play") ?  MacroPoolCell.prerenderedItems.playSymbol.rect : MacroPoolCell.prerenderedItems.pauseSymbol.rect);
        }
    };

    MacroPoolCell.prototype.customDraw = function(cell) {
        this.drawActiveMacro(cell.data);
        this.drawSymbols(cell.data);
    };

    ns.MacroPoolWindow = MacroPoolWindow;
    ns.MacroPoolCell = MacroPoolCell;
})(window.uiTypes.canvas);
