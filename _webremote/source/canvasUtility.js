defineNamespace(window, "uiTypes.canvas");

(function (ns) {
    var drawString = function (text, fontSize, maxWidth, maxHeight, measureText) {
        if (fontSize > maxHeight) {
            return false;
        }

        var ch = '';
        var charLength = 0;
        var index = 0;
        var length = 0;
        for (var i = 0; i < text.length; i++) {
            ch = text[i];
            charLength = measureText(ch).width;
            if ((length + charLength) > maxWidth) {
                break;
            }

            index = i;
            length += charLength;
        }

        return [{ line: text.substring(0, index + 1), length: length }];
    };


    var squeezeStringToRect = function(text, fontSize, maxWidth, maxHeight, measureText){
        var needLineBreak = false;
        var line = "";
        var lines = [];
        var lineWidth = 0;
        var firstChar = true;
        var ignoreChar = false;
        var fit = true;
        for (var i = 0; i < text.length; i++) {
            ignoreChar = false;

            var ch = text[i];
            if (ch == "|") {
                ch = text[i] = "\n";
                needLineBreak = true;
            }

            var chLength = measureText(ch).width;
            if (ch.charCodeAt(0) <= 32) {
                if ((ch == ' ') || (ch == '\t')) {
                    if (ch == '\t') {
                        ch = '    ';
                        chLength = measureText(ch).width;
                    }
                    lineWidth += chLength;
                    needLineBreak = checkNeedLineBreak(lineWidth, maxWidth, text, i+1, measureText);
                    if (needLineBreak === true) {
                        lineWidth -= chLength;
                    }
                } else if(ch == '\n') {
                    needLineBreak = true;
                } else {
                    ignoreChar = true;
                }
            } else {
                if (chLength) {
                    var nextX = lineWidth + chLength;
                    if (nextX > maxWidth) {
                        needLineBreak = true;

                        if (firstChar) {
                            // first char is too long for this line,
                            // it will be scaled
                            lineWidth = nextX;
                        } else {
                            // handle char on the next line
                            --i;
                        }
                    } else {
                        lineWidth = nextX;
                    }
                }
            }

            if (needLineBreak && !ignoreChar && firstChar) {
                line += ch;
            }

            firstChar = false;

            if (!needLineBreak && !ignoreChar) {
                line += ch;
            }

            if (needLineBreak || ((i === text.length - 1) && line)) {
                firstChar = true;
                needLineBreak = false;

                lines.push({line: line, length: lineWidth});

                lineWidth = 0;
                line = "";

                if (lines.length * fontSize > maxHeight) {
                    fit = false;
                    break;
                }
            }
        }

        if (fit) {
            return lines;
        } else {
            return false;
        }
    };

    var checkNeedLineBreak = function(lineWidth, maxWidth, text, charIndex, measureText){
        var freeSpace = maxWidth - lineWidth;
        var result = false;

        for (var i = charIndex; i < text.length; i++) {
            var ch = text[i];
            if ((ch == ' ') || (ch == '\t') || (ch == '\n')) {
                result = false;
                break;
            } else {
                var chLength = measureText(ch).width;
                freeSpace -= chLength;
                if (freeSpace < 0) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    };

    var drawRoundedCornerRect = function(ctx, rect, radius){
        if (!(radius instanceof Object)) {
            radius = {
                topRight: radius,
                topLeft: radius,
                bottomRight: radius,
                bottomLeft: radius
            };
        }

        var x = rect.x,
            y = rect.y,
            width = rect.width,
            height = rect.height;

        ctx.beginPath();
        ctx.moveTo(x + radius.topLeft, y);
        ctx.lineTo(x + width - radius.topRight, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.topRight);
        ctx.lineTo(x + width, y + height - radius.bottomRight);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.bottomRight, y + height);
        ctx.lineTo(x + radius.bottomLeft, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bottomLeft);
        ctx.lineTo(x, y + radius.topLeft);
        ctx.quadraticCurveTo(x, y, x + radius.topLeft, y);
        ctx.closePath();
    };

    var CanvasRenderer = function(context){
        this.ctx = context;

    };
    // {
    //     "text as a key" : {
    //         options: JSON.stringify({
    //             width: X,
    //             height: X,
    //             wishedFontSize: X,
    //             oneLine: bool
    //         }),
    //         fontSize: X,
    //         lines: [
    //             { line: text, length: textWidth },
    //             ...
    //         ]
    //     }
    // }
    CanvasRenderer.textCache = {};
    CanvasRenderer.transparent = "rgba(0,0,0,0)";

    CanvasRenderer.prototype.setContextProperty = function(propertyName, value) {
        if (this.ctx[propertyName] != value) {
            this.ctx[propertyName] = value;
        }
    };

    CanvasRenderer.prototype.drawLines = function(points, color, fillColor, width) {
        if (points.length <= 0) {
            return;
        }

        this.setContextProperty("strokeStyle", color);
        this.setContextProperty("fillStyle", fillColor);
        this.setContextProperty("lineWidth", width);
        this.ctx.beginPath();

        var start = true;
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            if (start) {
                this.ctx.moveTo(point.x, point.y);
                start = false;
            } else {
                this.ctx.lineTo(point.x, point.y);
            }

            if (point.end) {
                start = true;
            }
        }

        if (color) {
            this.ctx.stroke();
        }
        if (fillColor) {
            this.ctx.fill();
        }

        this.ctx.closePath();
    };

    CanvasRenderer.prototype.drawLine = function(pointFrom, pointTo, color, width) {
        this.setContextProperty("strokeStyle", color);
        this.setContextProperty("lineWidth", width);
        this.ctx.beginPath();
        this.ctx.moveTo(pointFrom.x, pointFrom.y);
        this.ctx.lineTo(pointTo.x, pointTo.y);
        this.ctx.stroke();
    };

    CanvasRenderer.prototype.drawRect = function(rect, borderColor, borderWidth, fillColor, radius) {
        rect.x = rect.x || rect.left || 0;
        rect.y = rect.y || rect.top || 0;

        if (radius) {
            drawRoundedCornerRect(this.ctx, rect, radius);
        }

        if (fillColor) {
            this.setContextProperty("fillStyle", fillColor);
            if (radius) {
                this.ctx.fill();
            } else {
                this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            }
        }
        if (borderColor && (borderWidth > 0)) {
            this.setContextProperty("strokeStyle", borderColor);
            this.setContextProperty("lineWidth", borderWidth || 1);
            if (radius) {
                this.ctx.stroke();
            } else {
                this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            }
        }
    };

    CanvasRenderer.prototype.drawCircle = function(centerPoint, radius, borderColor, borderWidth, fillColor){
        if (fillColor || borderColor) {
            this.ctx.beginPath();
            this.ctx.arc(centerPoint.x, centerPoint.y, radius, 0, 2 * Math.PI, false);
            if (fillColor) {
                this.setContextProperty("fillStyle", fillColor);
                this.ctx.fill();
            }

            if (borderColor) {
                this.setContextProperty("strokeStyle", borderColor);
                this.setContextProperty("lineWidth", borderWidth);
                this.ctx.stroke();
            }
        }
    };

    CanvasRenderer.prototype.drawImage = function(rect, image, srcRect){
        rect.x = rect.x || rect.left || 0;
        rect.y = rect.y || rect.top || 0;

        if (srcRect) {
            this.ctx.drawImage(image, srcRect.x, srcRect.y, srcRect.width, srcRect.height, rect.x, rect.y, rect.width, rect.height);
        } else {
            this.ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
        }
    };

    CanvasRenderer.prototype.measureText = function(text, font){
        this.setContextProperty("font", font);
        return this.ctx.measureText(text);
    };

    CanvasRenderer.prototype.fillText = function (rect, text, font, color, halign, valign, oneLine) {
        if (!text) {
            return;
        }

        font.min = font.min || 1;

        rect.x = rect.x || rect.left || 0;
        rect.y = rect.y || rect.top || 0;

        //this.drawRect(rect, "green", 1);

        var fontSuffix = "px " + font.family;
        var lines = [];
        var initFontSize = font.size || rect.height;
        var fontSize = initFontSize;

        var readyToDraw = false;

        var cachedTextItem = CanvasRenderer.textCache[text];
        if (cachedTextItem) {
            var options = JSON.stringify({
                width: rect.width,
                height: rect.height,
                wishedFontSize: fontSize,
                oneLine: oneLine
            });
            if (cachedTextItem.options == options) {
                lines = cachedTextItem.lines;
                fontSize = cachedTextItem.fontSize;
                readyToDraw = true;
            } else {
                cachedTextItem = undefined;
            }
        }

        if (!readyToDraw) {
            this.setContextProperty("font", utilities.math.floor(fontSize) + fontSuffix);
            var measureText = this.ctx.measureText.bind(this.ctx);

            // check if current text can be successfully rendered without any changes
            var textWidth = this.ctx.measureText(text).width;
            if (textWidth <= rect.width) {
                lines.push({ line: text, length: textWidth });
                readyToDraw = true;
            }

            if (!readyToDraw) {
                var fontSizeMap = {};
                fontSize = font.size || utilities.math.floor(rect.height);
                var start = font.min;
                var end = fontSize;
                while (start <= end) {
                    fontSize = Math.floor((end + start) / 2);
                    this.setContextProperty("font", fontSize + fontSuffix);
                    lines = oneLine ? drawString(text, fontSize, rect.width, rect.height, measureText) : squeezeStringToRect(text, fontSize, rect.width, rect.height, measureText);
                    fontSizeMap[fontSize] = lines || false;
                    if (lines) {
                        if (fontSizeMap[fontSize + 1] === false) {
                            break;
                        } else {
                            start = fontSize + 1;
                        }
                    } else {
                        --fontSize;
                        if (fontSizeMap[fontSize]) {
                            break;
                        } else {
                            end = fontSize;
                        }
                    }
                }
                lines = fontSizeMap[fontSize];
            }
        }

        var lineHeight = utilities.math.floor(Math.max(fontSize, font.min));
        this.setContextProperty("font", lineHeight + fontSuffix);
        this.setContextProperty("textAlign", halign);
        this.setContextProperty("textBaseline", valign);
        this.setContextProperty("fillStyle", color);
        var textHeight = lineHeight * lines.length;

        if (halign === "left") {
            // do nothing
        } else if (halign === "right") {
            rect.x += rect.width;
        } else if (halign === "center") {
            rect.x += rect.width / 2;
        } else {
            generic.statusLogging("fillText invalid parameter halign");
        }

        if (valign === "top") {
            // do nothing
        } else if (valign === "bottom") {
            rect.y += rect.height / 2 + lineHeight - lines.length/2 * lineHeight;
        } else if (valign === "middle") {
            rect.y += rect.height / 2 + lineHeight / 2 - lines.length/2 * lineHeight;
        } else {
            generic.statusLogging("fillText invalid parameter valign");
        }

        var lineY = utilities.math.round(rect.y);
        for (var i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i].line, rect.x, lineY, utilities.math.round(lines[i].length));
            lineY += lineHeight;
        }

        if (!cachedTextItem) {
            CanvasRenderer.textCache[text] = {
                options: JSON.stringify({
                    width: rect.width,
                    height: rect.height,
                    wishedFontSize: initFontSize
                }),
                fontSize: fontSize,
                lines: lines
            }
        }
    };

    ns.CanvasRenderer = function(context) { return new CanvasRenderer(context); };

    ns.CanvasRenderer.transformRectToBorderRect = CanvasRenderer.transformRectToBorderRect = function(rect, borderWidth){
        return {
            x: utilities.math.round(rect.x           + borderWidth/2),
            y: utilities.math.round(rect.y           + borderWidth/2),
            width: utilities.math.round(rect.width   - borderWidth),
            height: utilities.math.round(rect.height - borderWidth)
        };
    };

    ns.CanvasRenderer.applyOffset = CanvasRenderer.applyOffset = function(rect, offset){
        return {
            x: utilities.math.round(rect.x           + offset.left * rect.width),
            y: utilities.math.round(rect.y           + offset.top * rect.height),
            width: utilities.math.round(rect.width   - (offset.left + offset.right) * rect.width),
            height: utilities.math.round(rect.height - (offset.top + offset.bottom) * rect.height)
        };
    };

    ns.CanvasRenderer.getContentRect = CanvasRenderer.getContentRect = function(rect, borderWidth){
        if (!(borderWidth instanceof Object)) {
            borderWidth = {
                top: borderWidth,
                left: borderWidth,
                bottom: borderWidth,
                right: borderWidth
            };
        }

        return {
            x: utilities.math.round(rect.x           + borderWidth.left),
            y: utilities.math.round(rect.y           + borderWidth.top),
            width: utilities.math.round(rect.width   - borderWidth.left - borderWidth.right),
            height: utilities.math.round(rect.height - borderWidth.top - borderWidth.bottom)
        };
    };

    ns.CanvasRenderer.calculateLocationLine = CanvasRenderer.calculateLocationLine = function(base, rect) {
        return {
            pointFrom: {
                x: rect.x + rect.width * base.pointFrom.x,
                y: rect.y + rect.height * base.pointFrom.y
            },
            pointTo: {
                x: rect.x + rect.width * base.pointTo.x,
                y: rect.y + rect.height * base.pointTo.y
            }
        };
    };

    ns.CanvasRenderer.calculateLocationCircle = CanvasRenderer.calculateLocationCircle = function(base, rect) {
        return {
            center: {
                x: rect.x + rect.width * base.center.x,
                y: rect.y + rect.height * base.center.y
            },
            radius: rect.width * base.radius
        };
    };

    ns.CanvasRenderer.calculateLocationRect = CanvasRenderer.calculateLocationRect = function(base, rect) {
        return {
            x: rect.x + rect.width * base.x,
            y: rect.y + rect.height * base.y,
            width: rect.width * base.width,
            height: rect.height * base.height
        };
    };
})(window);

(function(ns){
    var CellBuilder = function(model) {
        this.$container = $(model);
        $("body").append(this.$container);

        this.modelStruct = [];
        this.modelMap = {};
        this.layout = {};
        this.layoutDirty = true;

        this.init();
    };

    CellBuilder.prototype.init = function() {
        var items = $("*[data-role]", this.$container);
        for(var i = 0; i < items.length; ++i){
            var item = {
                $item: $(items[i]),
                name: items[i].getAttribute("data-role")
            };
            this.modelStruct.push(item);
            this.modelMap[item.name] = item.$item;
        }
    };

    CellBuilder.prototype.build = function() {
        if (this.layoutDirty) {
            this.layout = {};
            this.m_baseRect = {
                x: this.$container.offset().left,
                y: this.$container.offset().top,
                width: this.$container.width(),
                height: this.$container.height()
            };

            for(var i = 0; i < this.modelStruct.length; ++i){
                var $item = this.modelStruct[i].$item;
                if ($item.is(":visible")) {
                    var rect = {
                        x: $item.offset().left / this.m_baseRect.width,
                        y: $item.offset().top / this.m_baseRect.height,
                        width: $item.width() / this.m_baseRect.width,
                        height: $item.height() / this.m_baseRect.height
                    };

                    this.layout[this.modelStruct[i].name] = rect;
                }
            }

            this.layoutDirty = false;
        }

        return this.layout;
    };

    CellBuilder.prototype.show = function(name) {
        if (!this.modelMap[name]) {
            generic.statusLogging("CellBuilder.show invalid argument 'name'=" + name);
            return;
        }

        if (this.modelMap[name].hasClass("hidden")) {
            this.layoutDirty = true;
            this.modelMap[name].removeClass("hidden");
        }
    };

    CellBuilder.prototype.hide = function(name) {
        if (!this.modelMap[name]) {
            generic.statusLogging("CellBuilder.hide invalid argument 'name'=" + name);
            return;
        }

        if (!this.modelMap[name].hasClass("hidden")) {
            this.layoutDirty = true;
            this.modelMap[name].addClass("hidden");
        }
    };

    CellBuilder.prototype.dispose = function() {
        this.$container.remove();
    };

    ns.CellBuilder = CellBuilder;
})(window.uiTypes.canvas);
