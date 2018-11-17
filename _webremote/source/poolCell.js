defineNamespace(window, "uiTypes.canvas");

(function(ns){
    var PoolCell = (function(){
        var PoolCell = function(renderer) {
            this.m_defaultSettings = {
                fontSize: utility.getDefaultFontSize(),
                leading: 0.3, // em
                fontFamily: "Helvetica",

                margin: {
                    top:    0.02,
                    left:   0.02,
                    bottom: 0.02,
                    right:  0.02
                }, // percents
                padding: {
                    top:    0.02,
                    left:   0.02,
                    bottom: 0.00,
                    right:  0.02
                }, // percents

                bgColor : remoteColors.pools.cell.backgroundColor,
                textColor: remoteColors.pools.cell.color
            };
            if(!isDot2())
            {
                this.topHalf = {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 0.5,
                    noncontent: true,
                    color : remoteColors.pools.cell.topHalf.backgroundColor,
                };

                this.bottomHalf = {
                    x: 0,
                    y: 0.5,
                    width: 1,
                    height: 0.5,
                    noncontent: true,
                    gradient1: remoteColors.pools.cell.bottomHalf.backgroundColor1,
                    gradient2: remoteColors.pools.cell.bottomHalf.backgroundColor2
                };

                this.stateStripe = {
                    enabled: false,
                    noncontent: true,
                    pointFrom: {
                        x: 0,
                        y: 0.5
                    },
                    pointTo : {
                        x: 1,
                        y: 0.5
                    },
                    width: 0.04,
                    color: remoteColors.pools.cell.stateStripe.color
                };

                this.border = {
                    color: remoteColors.pools.cell.border.color,
                    size: 2,
                    focusColor: remoteColors.pools.cell.border.focusColor,
                    focusSize: 4,
                    roundedCornerRadius: 8,
                };
            }
            else
            {
                this.element = {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    noncontent: true,
                    bgColor : remoteColors.pools.cell.backgroundColor,
                }

                this.stateStripe = {
                    enabled: false,
                    noncontent: true,
                    pointFrom: {
                        x: 0.4,
                        y: 0.1
                    },
                    pointTo : {
                        x: 0.8,
                        y: 0.1
                    },
                    width: 0.04,
                    color: remoteColors.pools.cell.stateStripe.color
                };

                this.border = {
                    color: remoteColors.pools.cell.border.color,
                    size: 1,
                    focusColor: remoteColors.pools.cell.border.focusColor,
                    focusSize: 4,
                    roundedCornerRadius: 0,
                };
            }

            this.index = {
                x: 0,
                y: 0,
                width: 0.5,
                height: 0.2,
                halign: "center",
                valign: "middle",
                defaultColor : remoteColors.pools.cell.index.color,
                referencedColor: remoteColors.pools.cell.index.referencedColor
            };

            if(isDot2())
            {
                this.index.halign = "left";
                this.index.x = 0.05;
                this.index.y = 0.02;
            }

            this.title = {
                x: 0,
                y: 0.5,
                width: 1,
                height: 0.5,
                halign: "center",
                valign: "middle"
            };

            if(isDot2())
            {
                this.title.y = .18;
                this.title.height = .82;
            }

            this.rects = {
                default: {},
                cell: {},
                innerCell : {},
                content: {}
            };

            this.renderer = renderer;
        };

        PoolCell.prototype.calculateWidth = function(value) {
            var rect = value.noncontent ? this.rects.innerCell : this.rects.content;
            return rect.width * value.value;
        };

        PoolCell.prototype.calculateHeight = function(value) {
            var rect = value.noncontent ? this.rects.innerCell : this.rects.content;
            return rect.height * value.value;
        };

        PoolCell.prototype.calculateLocation = function(base, pivotRect) {
            if (!this.rects.content) {
                generic.statusLogging("PoolCell.prototype.getLocation invalid member variable this.rects.content");
                throw Error();
            }

            var rect = pivotRect || (base.noncontent ? this.rects.innerCell : this.rects.content);

            if (base.pointFrom && base.pointTo) {
                return CanvasRenderer.calculateLocationLine(base, rect);
            }

            if (base.center && base.radius) {
                return CanvasRenderer.calculateLocationCircle(base, rect);
            }

            return CanvasRenderer.calculateLocationRect(base, rect);
        };

        PoolCell.prototype.drawTopHalf = function(data) {
            if (!data.text) { return; }
            this.renderer.drawRect(this.calculateLocation(this.topHalf), 0, 0, this.topHalf.color, {
                topLeft: this.border.roundedCornerRadius,
                topRight: this.border.roundedCornerRadius,
                bottomLeft: 0,
                bottomRight: 0
            });
        };

        PoolCell.prototype.drawBottomHalf = function(data) {
            if (!data.text) { return; }
            this.renderer.drawRect(this.calculateLocation(this.bottomHalf), 0, 0, this.bottomHalf.gradient1, {
                topLeft: 0,
                topRight: 0,
                bottomLeft: this.border.roundedCornerRadius,
                bottomRight: this.border.roundedCornerRadius
            });
        };

        PoolCell.prototype.drawBackground = function() {
            if(isDot2())
            {
                //drawRect = function(ctx, rect, roundedCorners, backgroundColor, borderColor)
                this.renderer.drawRect(this.calculateLocation(this.element), 0, 0, this.element.bgColor, {
                    topLeft: 0,
                    topRight: 0,
                    bottomLeft: 0,
                    bottomRight: 0
                });
            }
        };

        PoolCell.prototype.drawName = function(data) {
            var text = data.text;
            if (text === undefined) { return; }

            var rect = this.calculateLocation(this.title);
            //function (rect, text, font, color, halign, valign, oneLine)
            this.renderer.fillText(rect, text, {
                family: this.m_defaultSettings.fontFamily,
                size: this.m_defaultSettings.fontSize
            }, data.color || this.m_defaultSettings.textColor, this.title.halign, this.title.valign);
        };

        PoolCell.prototype.drawBorder = function(data, focused) {
            var borderSize = focused ? this.border.focusSize : this.border.size;
            var borderRect = CanvasRenderer.transformRectToBorderRect(this.rects.cell, borderSize);

            this.renderer.drawRect(
                borderRect,
                focused ? (data.focusCellBorderColor || this.border.focusColor) : (data.borderColor || this.border.color),
                focused ? this.border.focusSize : this.border.size,
                0,
                focused ? 0 : this.border.roundedCornerRadius
            );
        };

        PoolCell.prototype.drawMiscRects = function (data) {
            if (!this.miscRects || !data.miscRects) { return; }

            var index = 0;
            for (var i = 0; i < data.miscRects.length; i++) {
                if(isDot2() && i != 3)
                {
                    continue;
                }
                var rect = data.miscRects[i];
                if (rect) {
                    var item = $.extend(true, {}, this.miscRects.array[i]);
                    if (rect.width) {
                        item.pointTo.x = (item.pointTo.x - item.pointFrom.x) * rect.width;
                    }
                    var itemPoints = this.calculateLocation(item);
                    var lineWidth = utilities.math.round(this.calculateHeight({ value : item.width }));
                    this.renderer.drawLine(itemPoints.pointFrom, itemPoints.pointTo, item.color, lineWidth);
                }
            }
        };

        PoolCell.prototype.drawStateStripe = function(data) {
            if (!this.stateStripe.enabled || !data.text) { return; }

            var points = this.calculateLocation(this.stateStripe);
            var lineWidth = utilities.math.round(this.calculateHeight({ value : this.stateStripe.width, noncontent: this.stateStripe.noncontent }));
            this.renderer.drawLine(points.pointFrom, points.pointTo, data.stateStripeColor || this.stateStripe.color, lineWidth);
        };

        PoolCell.prototype.drawIndex = function(data) {
            var index = data.index;
            if (index === undefined) {
                window.generic.statusLogging("index is undefined!!!");
                return;
            }

            var rect = this.calculateLocation(this.index);
            var color = data.isReferenced ? this.index.referencedColor : this.index.defaultColor;
            this.renderer.fillText(rect, index, { family: this.m_defaultSettings.fontFamily }, color, this.index.halign, this.index.valign);
        };

        // {
        //     width: 0,
        //     height: 0,
        //     pixelPerEm: 0,
        //     x: 0,
        //     y: 0,
        //     data: {
        //       text: "",
        //       index: 0,
        //       focusCellBorderColor: "#000000",
        //       borderColor: "#000000",
        //
        //       stateStripeColor: "#000000"
        //    }
        // }
        PoolCell.prototype.draw = function (cell, focused) {
            var data = cell.data;

            this.rects.default = {
                x: utilities.math.round(cell.x),
                y: utilities.math.round(cell.y),
                width: utilities.math.round(cell.width),
                height: utilities.math.round(cell.height)
            };

            this.rects.cell = CanvasRenderer.applyOffset(this.rects.default, this.m_defaultSettings.margin);

            var frameSize = utilities.math.getMinMax(this.border.focusSize, this.border.size);

            this.rects.innerCell = CanvasRenderer.getContentRect(this.rects.cell, frameSize.min);

            this.rects.content = CanvasRenderer.getContentRect(this.rects.cell, frameSize.max);
            this.rects.content = CanvasRenderer.applyOffset(this.rects.content, this.m_defaultSettings.padding);


            if(!isDot2())
            {
                this.drawTopHalf(cell.data);
                this.drawBottomHalf(cell.data);
            }
            else
            {
                this.drawBackground();
            }

            if(!isDot2())
            {
                this.drawIndex(cell.data);
                this.drawName(cell.data);
                this.drawStateStripe(cell.data);
                this.customDraw({
                    pixelPerEm: cell.pixelPerEm,
                    data: cell.data
                });
                this.drawMiscRects(cell.data);
                this.drawBorder(cell.data, focused);
            }
            else
            {
                this.drawIndex(cell.data);
                this.customDraw({
                    pixelPerEm: cell.pixelPerEm,
                    data: cell.data
                });
                this.drawMiscRects(cell.data);
                this.drawBorder(cell.data, focused);
                this.drawName(cell.data);
                this.drawStateStripe(cell.data);
            }
        };

        PoolCell.prototype.customDraw = function (cell) {
        };

        return PoolCell;
    })();

    ns.PoolCell = PoolCell;

})(window.uiTypes.canvas);
