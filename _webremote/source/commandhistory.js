window.uiTypes.pages.CommandHistory = (function(){

    var CommandHistory = function(commandLine, commandExecutor, globalSettings) {
        CommandHistory.superclass.constructor.call(this, $.createItem({ class:"canvas-container", html: "<div><canvas>Sorry, your browser is not supported.</canvas></div>"}), commandLine, commandExecutor, globalSettings);

        this.requirements = {

        };

        this.CreateWindow = function () {
            this.m_ma2window = new window.uiTypes.canvas.CommandHistoryWindow(this.canvas, window.CanvasRenderer(this.canvas[0].getContext("2d")), { top: 0, left: 0, width: this.canvas[0].width, height: this.canvas[0].height });
            this.m_ma2window.init(true);
            DataHandlerManager.Register({ name: this.id + "DataHandler", handler: this.m_ma2window.commandHistoryRender.bind(this.m_ma2window) });
        }

        this.GetPayloadObject = function () {
            var payload = new Object();
            payload.requestType = Server.requestTypes.commandHistory;
            payload.cntCols = this.m_ma2window.GetVisibleColsCount();
            payload.cntRows = this.m_ma2window.GetVisibleRowsCount();
            payload.offCol = this.m_ma2window.GetDataOffsetX();
            payload.offRow = this.m_ma2window.GetDataOffsetY();
            return payload;
        }
    }
    window.generic.extend(CommandHistory, window.uiTypes.pages.CanvasPage);
    CommandHistory.prototype.Init = function () {
        CommandHistory.superclass.Init.call(this);

        this.$page.append(this.canvasContainer);
    }
    CommandHistory.id = "commandHistory";
    CommandHistory.title = "Command History";
    CommandHistory.content ='<div id="' + CommandHistory.id + '"></div>';

    return CommandHistory;
})();

window.uiTypes.canvas.CommandHistoryWindow = (function(){
    var CommandHistoryWindow = function(parentElement, renderer, rect) {
        CommandHistoryWindow.superclass.constructor.call(this, parentElement, renderer, rect);
        $.extend(this.m_defaultSettings, {
            cellFontSize: 0,
            fontSizeToCellHeightCoef : 5 / 3,
            fontSizeToCellWidthCoef : 10 / 3,
            horzScrollWidthFactorOfWindowWidth : 3,
            backgroundColor: remoteColors.commandHistory.backgroundColor,
            fillStyle: remoteColors.commandHistory.fillStyle
        });

        this.m_contentSettings = {
            colsCount: 0,
            rowsCount : 0,
            cellHeight: 0,
            cellWidth: 0
        };

        this.m_offset = {
            x: 0,
            y: 0
        };

        this.m_wheelStartPoint = 0;

        this.init = function (invertVerticalScroll) {
            CommandHistoryWindow.superclass.init.call(this, invertVerticalScroll);
            this.setFontSize();
            this.m_redrawWholeCanvas = true;
        }
        this.setFontSize = function() {
            var size = utility.getDefaultFontSize();
            this.m_defaultSettings.cellFontSize = size;
            this.m_contentSettings.cellHeight = parseInt(this.m_defaultSettings.cellFontSize * this.m_defaultSettings.fontSizeToCellHeightCoef);
            this.m_contentSettings.cellWidth = parseInt(this.m_defaultSettings.cellFontSize * this.m_defaultSettings.fontSizeToCellWidthCoef);

            this.m_redrawWholeCanvas = true;
        }
        this.resize = function (rect, _init) {
            CommandHistoryWindow.superclass.resize.call(this, rect, _init);

            this.SyncHOffset();
            this.SyncVOffset();
        }
        this.commandHistoryRender = function (consolereturn) {
            if (!consolereturn || (consolereturn.responseType != Server.requestTypes.commandHistory)) {
                return false;
            }

            var commandHistory = consolereturn;
            this.m_contentSettings.colsCount = commandHistory.cntCols;
            this.m_contentSettings.rowsCount = commandHistory.cntRows;
            this.refresh(commandHistory);
            return true;
        }

        //#region Drawing
        this.refresh = function (commandHistory) {
            CommandHistoryWindow.superclass.refresh.call(this);
            if (!commandHistory) {
                return;
            }

            var data = commandHistory.data;

            var n_cols = data.length;

            this.renderer.drawRect(this.GetContentRect(), 0, 0, this.m_defaultSettings.backgroundColor);

            for (var row = 0; row < n_cols; row++) {
                var row_data = data[row];
                this.commandHistoryDrawLine((row + 1), row_data[0]);
            }

            this.drawScrollBars();
        }
        this.commandHistoryDrawLine = function (row, col) {
            var contentRect = this.GetContentRect();
            var messageWidth = contentRect.width - contentRect.x;
            var lineRect = {
                x: contentRect.x,
                y: contentRect.y + contentRect.height - (row * this.m_contentSettings.cellHeight),
                width: messageWidth,
                height: this.m_contentSettings.cellHeight
            };
            this.renderer.drawRect(lineRect, 0, 0, remoteColors.commandHistory.lineBackgroundColor);

            this.drawCommandLine(lineRect.x - this.GetDataOffsetX(), lineRect.y + (this.m_contentSettings.cellHeight / 2), col);
        }
        this.drawCommandLine = function (x, y, commandString) {
            var letterWidth = 0;
            var textHAlign = "left";
            var textVAlign = "middle";
            var font = "Courier";
            var hasAnsi = commandString.indexOf("#");
            if (hasAnsi != -1) {
                var ansiColor = [];
                ansiColor[30] = "#000000";
                ansiColor[31] = "#7B0007";
                ansiColor[32] = "#1D830C";
                ansiColor[33] = "#7E8211";
                ansiColor[34] = "#14007E";
                ansiColor[35] = "#14007E";
                ansiColor[36] = "#257C7B";
                ansiColor[37] = "#BBBBBB";
                var pixelOffset = 0;
                var text = "";
                while (hasAnsi >= 0) {
                    if ((hasAnsi > 0) && (pixelOffset == 0)) {
                        text = commandString.substring(0, hasAnsi);

                        this.renderer.fillText({ x: x + pixelOffset, y: y, height: this.m_defaultSettings.cellFontSize }, text, { family: font }, ansiColor[37], textHAlign, textVAlign);
                        pixelOffset += this.renderer.measureText(text, this.m_defaultSettings.cellFontSize + "px" + font).width;
                    }
                    var controlEnd = commandString.indexOf("m", hasAnsi + 2);
                    var control = commandString.substring(hasAnsi + 2, controlEnd);
                    hasAnsi = commandString.indexOf("#[", hasAnsi + 1);
                    text = (hasAnsi != -1) ? commandString.substring(controlEnd + 1, hasAnsi) : commandString.substring(controlEnd + 1);

                    this.renderer.fillText({ x: x + pixelOffset, y: y, height: this.m_defaultSettings.cellFontSize }, text, { family: font }, ansiColor[control], textHAlign, textVAlign);

                    pixelOffset += this.renderer.measureText(text, this.m_defaultSettings.cellFontSize + "px" + font).width;
                }
            } else {
                this.renderer.fillText({ x: x, y: y, height: this.m_defaultSettings.cellFontSize }, commandString, { family: font }, remoteColors.commandHistory.color, textHAlign, textVAlign);
            }
        }
        //#endregion

        //#region Scroll event handlers
        this.wheelStart = function () {
            this.m_wheelStartPoint = { offsetX: this.m_offset.x, offsetY: this.m_offset.y };
            //window.generic.statusLogging("wheel Start. Point X: " + this.m_wheelStartPoint.offsetX + ", Y: " + this.m_wheelStartPoint.offsetY);
        }
        this.wheelEnd = function () {
            this.m_wheelStartPoint = 0;
        }

        //#region Horizontal Scroll
        this.hStep = function (direction) {
            if (direction === "forward") {
                if (this.m_offset.x < this.GetFullScrollableWidth()) {
                    this.m_offset.x += this.m_contentSettings.cellHeight;
                    this.m_offset.x = Math.min(this.GetFullScrollableWidth(), this.m_offset.x);
                }
                this.SyncHOffset();
            } else if (direction === "back") {
                if (this.m_offset.x > 0) {
                    this.m_offset.x -= this.m_contentSettings.cellHeight;
                    this.m_offset.x = Math.max(0, this.m_offset.x);
                }
                this.SyncHOffset();
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
            if (!offset) {
                return;
            }
            this.m_offset.x = Math.min(this.GetFullScrollableWidth(), Math.max(0, this.m_wheelStartPoint.offsetX + offset * this.GetFullScrollableWidth()));
            this.SyncHOffset();
        }
        this.SyncHOffset = function () {
            this.GetHScroll().SetOffset(this.m_offset.x / this.GetFullScrollableWidth());
        }
        //#endregion

        //#region Vertical Scroll
        this.vStep = function (direction) {
            if (direction === "forward") {
                var maxVerticalOffset = Math.max(0, this.m_contentSettings.rowsCount - this.GetVisibleRowsCount());
                if (this.m_offset.y < maxVerticalOffset) {
                    ++this.m_offset.y;
                }
                this.SyncVOffset();
            } else if (direction === "back") {
                if (this.m_offset.y > 0) {
                    --this.m_offset.y;
                }
                this.SyncVOffset();
            }
        }
        this.vStepPage = function (direction) {
            if (direction === "forward") {
                return 10;
            } else if (direction === "back") {
                return -10;
            }
            return 0;
        }
        this.vWheel = function (offset) {
            //window.generic.statusLogging(offset);
            if (!offset) {
                return;
            }

            var maxVerticalOffset = Math.max(this.m_contentSettings.rowsCount - this.GetVisibleRowsCount(), 0);
            this.m_offset.y = Math.min(maxVerticalOffset, Math.max(0, parseInt(this.m_wheelStartPoint.offsetY + offset * maxVerticalOffset)));
            this.SyncVOffset();
        }
        this.SyncVOffset = function () {
            var maxVerticalOffset = (this.m_contentSettings.rowsCount - this.GetVisibleRowsCount()) || this.m_offset.y;
            this.GetVScroll().SetOffset(this.m_offset.y / maxVerticalOffset);
        }
        //#endregion
        //#endregion

        //#region Interface to scrollbars
        this.GetVisibleScrollableWidth = function () {
            return this.GetContentRect().width - this.m_contentSettings.cellWidth;
        }
        this.GetVisibleScrollableHeight = function () {
            return this.GetContentRect().height - this.m_contentSettings.cellHeight;
        }
        this.GetFullScrollableWidth = function () {
            return this.GetVisibleScrollableWidth() * 3;
        }
        this.GetFullScrollableHeight = function () {
            return this.m_contentSettings.rowsCount * this.m_contentSettings.cellHeight;
        }
        //#endregion

        //#region Parent class uses this
        this.GetVisibleColsCount = function () {
            return 2;
        }
        this.GetVisibleRowsCount = function () {
            return Math.floor(this.GetContentRect().height / this.m_contentSettings.cellHeight) - 1;
        }
        this.GetDataOffsetX = function () {
            return this.m_offset.x;
        }
        this.GetDataOffsetY = function () {
            return this.m_offset.y;
            //commandHistoryWindow.dataOffsetY;
        }
        //#endregion
    }
    window.generic.extend(CommandHistoryWindow, window.uiTypes.canvas.MA2Window);

    return CommandHistoryWindow;

})();
