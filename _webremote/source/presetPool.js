defineNamespace(window, "uiTypes.canvas");
defineNamespace(window, "uiTypes.pages");

(function(ns){
    var PageBase = window.uiTypes.pages.Page;

    var PresetPool = function(commandLine, commandExecutor, globalSettings) {
        PresetPool.superclass.constructor.call(this, $.createItem({ class:"canvas-container", html: "<div><canvas></canvas></div>"}), commandLine, commandExecutor, globalSettings);

        window.poolViewVisible = true;
        this.requirements = {
            presetTypeBar: true
        };
    };
    window.generic.extend(PresetPool, window.uiTypes.pages.PoolPage);

    PresetPool.prototype.GetWindowClass = function () {
        return window.uiTypes.canvas.PresetPoolWindow;
    };

    PresetPool.prototype.CreateWindow = function () {
        PresetPool.superclass.CreateWindow.call(this);
        $(this).triggerHandler(PageBase.events.pageButtonsChanged, { buttons: this.CreatePageButtons() });
    };

    PresetPool.prototype.CreatePageButtons = function() {
        if(!this.pageButtons){
            this.pageButtons = [
                { command: commands.Commands.store(), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.Commands.clear(), uiElement: commands.ui.UIMultiStateButton() }
            ];
            this.pageButtons.forEach(commands.ui.initCommandUIElementPair);
            generic.globs.serverCommandManager.addCommands(this.id, this.pageButtons);
        }
        return this.pageButtons;
    };

    PresetPool.prototype.ItemSelected = function (event, args) {
        var id_1 = args.id;
        var id_2 = args.presetTypeId;
        var cmdlineText = this.m_commandLine.getText();

        this.m_commandExecutor.send({
            requestType: Server.requestTypes.pool_itemSelected,
            pool: PresetPool.shortId,
            id_1: id_1,
            id_2: id_2,
            cmdlineText: cmdlineText
        });
    };

    PresetPool.id = "presetPool";
    PresetPool.shortId = "preset";
    if(isDot2())
    {
        PresetPool.title = "Presets";
    }
    else
    {
        PresetPool.title = "Preset Pool";
    }
    PresetPool.content = '<div id="' + PresetPool.id + '"></div>';

    ns.PresetPool = PresetPool;
})(window.uiTypes.pages);

(function(ns){
    var PresetPoolWindow = function(parentElement, renderer, rect) {
        PresetPoolWindow.superclass.constructor.call(this, parentElement, renderer, rect, ns.PresetPoolCell);

        $.extend(this.m_defaultSettings, {
            storage: Storage.AddSection(window.uiTypes.pages.PresetPool.id)
        });

        this.m_currentPresetTypeId = -1;
    };
    window.generic.extend(PresetPoolWindow, window.uiTypes.canvas.PoolWindow);
    PresetPoolWindow.prototype.getItem = function (poolData, itemData) {
        var item = PresetPoolWindow.superclass.getItem(poolData, itemData);
        $.extend(item, {
            stateStripeColor: itemData.stateStripeC || poolData.stateStripeC,
            isReferenced: itemData.isRef,
            symbol: {
                wheelColor: itemData.symbol ? itemData.symbol.wheelC : "",
                mixColor: itemData.symbol ? itemData.symbol.mixC : "",
                color: itemData.symbol ? itemData.symbol.c : "",
                hasWheelSlots: itemData.symbol ? itemData.symbol.hasWheelSlots : false,
            },
            amountOfUsed: itemData.amountOfUsed,
            dimmer: itemData.dimmer,
            specialChars: [
                itemData.hasSelectiveData,
                itemData.hasGlobalData,
                itemData.hasUniversalData,
                itemData.hasEmbedded
            ],
            miscRects: [
                itemData.hasValues,
                itemData.hasFades,
                itemData.hasDelays,
                itemData.hasEffect
            ]
        });
        return item;
    };

    PresetPoolWindow.prototype.SetDataSource = function (consolereturn) {
        if (consolereturn.responseType != Server.requestTypes.pool) {
            return false;
        }
        if (consolereturn.pool != "preset") {
            return false;
        }

        this.m_currentPresetTypeId = consolereturn.presetType;
        return PresetPoolWindow.superclass.SetDataSource.call(this, consolereturn);
    };

    PresetPoolWindow.prototype.onItemSelected = function(args){
        args.presetTypeId = this.m_currentPresetTypeId;
        PresetPoolWindow.superclass.onItemSelected.call(this, args);
    };

    var PresetPoolCell = function(renderer) {
        PresetPoolCell.superclass.constructor.call(this, renderer);

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
            $.extend(this.border, {
                color: remoteColors.presetPool.cell.borderColor
            });
        }

        this.title.width = 0.94;
        this.stateStripe.enabled = true;

        this.amountOfUsed = {
            x: 0,
            y: 0.24,
            width: 1,
            height: 0.24,
            halign: "left",
            valign: "middle",
            color: remoteColors.presetPool.cell.amountOfUsed.color
        };

        if(isDot2())
        {
            this.symbol = {
                x: 0.55,
                y: 0.04,
                width: 0.6, // %
                height: 0.6, //%
                borderWidth: 1,// px

                bigCircle: {
                    center:{
                        x: 0.4,
                        y: 0.4
                    },
                    radius: 0.4
                },

                bigSquare: {
                    x: 0,
                    y: 0,
                    width: 0.8,
                    height: 0.8
                },

                littleCircle: {
                    center:{
                        x: 0.65,
                        y: 0.65
                    },
                    radius: 0.15
                },

                littleSquare: {
                    x: 0.4,
                    y: 0.4,
                    width: 0.5,
                    height: 0.5
                }
            };
        }
        else
        {
            this.symbol = {
                x: 0.75,
                y: 0.08,
                width: 0.3, // %
                height: 0.3, //%
                borderWidth: 1,// px

                bigCircle: {
                    center:{
                        x: 0.4,
                        y: 0.4
                    },
                    radius: 0.4
                },

                bigSquare: {
                    x: 0,
                    y: 0,
                    width: 0.8,
                    height: 0.8
                },

                littleCircle: {
                    center:{
                        x: 0.65,
                        y: 0.65
                    },
                    radius: 0.15
                },

                littleSquare: {
                    x: 0.4,
                    y: 0.4,
                    width: 0.5,
                    height: 0.5
                }
            };
        }

        if(isDot2())
        {
            this.dimmer = {
                x: 0.95,
                y: 0.05,
                width: 0.05,
                height: 0.9,
                border: 1, // px

                background: remoteColors.presetPool.cell.dimmer.backgroundColor,
                color: remoteColors.presetPool.cell.dimmer.color
            };
        }
        else
        {
            this.dimmer = {
                x: 0.95,
                y: 0.54,
                width: 0.05,
                height: 0.46,
                border: 1, // px

                background: remoteColors.presetPool.cell.dimmer.backgroundColor,
                color: remoteColors.presetPool.cell.dimmer.color
            };
        }

        if(!isDot2())
        {
            this.specialChars = {
                x: 0.5,
                y: 0.0,
                width: 0.25,
                height: 0.48,

                array: [
                    {
                        color: remoteColors.presetPool.cell.specialChars[0].color,
                        char: 'S',
                        halign: "center",
                        valign: "top"
                    },
                    {
                        color: remoteColors.presetPool.cell.specialChars[1].color,
                        char: 'G',
                        halign: "center",
                        valign: "top"
                    },
                    {
                        color: remoteColors.presetPool.cell.specialChars[2].color,
                        char: 'U',
                        halign: "center",
                        valign: "top"
                    },
                    {
                        color: remoteColors.presetPool.cell.specialChars[3].color,
                        char: 'E',
                        halign: "center",
                        valign: "top"
                    }
                ]
            };
        }

        // are placed on stateStripe
        this.miscRects = {
            array: [
                {
                    color: remoteColors.presetPool.cell.miscRects[0].color,
                    pointFrom: {
                        x: 0,
                        y: 0.5
                    },
                    pointTo : {
                        x: 0.25,
                        y: 0.5
                    },
                    width: 0.06,
                },
                {
                    color: remoteColors.presetPool.cell.miscRects[1].color,
                    pointFrom: {
                        x: 0.25,
                        y: 0.5
                    },
                    pointTo : {
                        x: 0.5,
                        y: 0.5
                    },
                    width: 0.06,
                },
                {
                    color: remoteColors.presetPool.cell.miscRects[2].color,
                    pointFrom: {
                        x: 0.5,
                        y: 0.5
                    },
                    pointTo : {
                        x: 0.75,
                        y: 0.5
                    },
                    width: 0.06,
                },
                {
                    color: remoteColors.presetPool.cell.miscRects[3].color,
                    pointFrom: {
                        x: 0.75,
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

        if(isDot2())
        {
            this.miscRects = {
                array: [
                    {
                        color: remoteColors.presetPool.cell.miscRects[0].color,
                        pointFrom: {
                            x: 0,
                            y: 0.5
                        },
                        pointTo : {
                            x: 0.25,
                            y: 0.5
                        },
                        width: 0.06,
                    },
                    {
                        color: remoteColors.presetPool.cell.miscRects[1].color,
                        pointFrom: {
                            x: 0.25,
                            y: 0.5
                        },
                        pointTo : {
                            x: 0.5,
                            y: 0.5
                        },
                        width: 0.06,
                    },
                    {
                        color: remoteColors.presetPool.cell.miscRects[2].color,
                        pointFrom: {
                            x: 0.5,
                            y: 0.5
                        },
                        pointTo : {
                            x: 0.75,
                            y: 0.5
                        },
                        width: 0.06,
                    },
                    {
                        color: remoteColors.presetPool.cell.miscRects[3].color,
                        pointFrom: {
                            x: 0.05,
                            y: 0.3
                        },
                        pointTo : {
                            x: 0.058,
                            y: 0.8
                        },
                        width: 0.06,
                    }
                ]
            };
        }
    };
    window.generic.extend(PresetPoolCell, window.uiTypes.canvas.PoolCell);

    PresetPoolCell.prototype.drawAmountOfUsed = function (data, pixelPerEm) {
        if (data.amountOfUsed) {
            var rect = this.calculateLocation(this.amountOfUsed),
                value = data.amountOfUsed;

            if ((value !== "") && (value !== undefined)) {
                this.renderer.fillText(rect, value, { family: this.m_defaultSettings.fontFamily }, this.amountOfUsed.color, this.amountOfUsed.halign, this.amountOfUsed.valign);
            }
        }
    };

    PresetPoolCell.prototype.drawSymbol = function (data) {
        if (data.symbol) {
            var rect = this.calculateLocation(this.symbol),
                wheelColor = data.symbol.wheelColor,
                mixColor = data.symbol.mixColor,
                color = data.symbol.color,
                hasWheelSlots = data.symbol.hasWheelSlots;

            rect.width = rect.height = Math.min(rect.width, rect.height);

            if (mixColor && !wheelColor) {
                var bigSquare = this.calculateLocation(this.symbol.bigSquare, rect);
                this.renderer.drawRect(bigSquare, 0, 0, color);
            } else {
                var bigCircle = this.calculateLocation(this.symbol.bigCircle, rect);
                this.renderer.drawCircle(bigCircle.center, bigCircle.radius, 0, 0, color);
            }

            if (wheelColor && (mixColor || hasWheelSlots)) {
                var littleCircle = this.calculateLocation(this.symbol.littleCircle, rect);
                this.renderer.drawCircle(littleCircle.center, littleCircle.radius, 0, 0, wheelColor);
            }

            if (mixColor && (wheelColor || hasWheelSlots)) {
                var littleSquare = this.calculateLocation(this.symbol.littleSquare, rect);
                littleSquare = CanvasRenderer.getContentRect(littleSquare, this.symbol.borderWidth);
                this.renderer.drawRect(CanvasRenderer.transformRectToBorderRect(littleSquare, this.symbol.borderWidth), mixColor, this.symbol.borderWidth, 0);
            }
        }
    };

    PresetPoolCell.prototype.drawDimmerBar = function (data) {
        var dimmer = data.dimmer;
        if (dimmer !== undefined) {
            var outerRect = this.calculateLocation(this.dimmer);
            this.renderer.drawRect(outerRect, 0, 0, this.dimmer.background);

            var innerRect = CanvasRenderer.getContentRect(outerRect, this.dimmer.border);
            var dimmerHeight = innerRect.height * dimmer;
            innerRect.y = innerRect.y + innerRect.height - dimmerHeight;
            innerRect.height = dimmerHeight;
            this.renderer.drawRect(innerRect, 0, 0, this.dimmer.color);
        }
    };

    var getNextRect = function(index, baseRect){
        if (index < 0 || 3 < index) {
            generic.statusLogging("PresetPoolCell.getNextRect invalid parameter index");
            throw Error();
        }

        return {
            x: baseRect.x + (index % 2) * baseRect.width / 2,
            y: baseRect.y + ((index > 1) ? baseRect.height / 2 : 0),
            width: baseRect.width / 2 * 0.9,
            height: baseRect.height / 2 * 0.9
        };
    };
    PresetPoolCell.prototype.drawSpecialChars = function (data) {
        if (!data.specialChars) { return; }

        var rect = this.calculateLocation(this.specialChars);

        var index = 0;
        for (var i = 0; i < data.specialChars.length; i++) {
            if (data.specialChars[i]) {
                var itemRect = getNextRect(index, rect);
                var item = this.specialChars.array[i];
                this.renderer.fillText(itemRect, item.char, { family: this.m_defaultSettings.fontFamily }, item.color, item.halign, item.valign);
                ++index;
            }
        }
    };

    // {
    //     width: 0,
    //     height: 0,
    //     x: 0,
    //     y: 0,
    //     pixelPerEm: 0,
    //     data: {
    //       ...
    //    }
    // }
    PresetPoolCell.prototype.customDraw = function (cell) {
        if(!isDot2())
        {
            this.drawAmountOfUsed(cell.data, cell.pixelPerEm);
        }
        this.drawSymbol(cell.data);
        this.drawDimmerBar(cell.data);
        if(!isDot2())
        {
            this.drawSpecialChars(cell.data);
        }
    };


    ns.PresetPoolWindow = PresetPoolWindow;
    ns.PresetPoolCell = PresetPoolCell;
})(window.uiTypes.canvas);
