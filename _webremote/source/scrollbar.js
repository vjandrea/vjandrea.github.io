window.uiTypes.canvas.MouseEvent = (function(){
    var MouseEvent = function() {};

    MouseEvent.down = 0;
    MouseEvent.up = 0;
    MouseEvent.move = 0;

    return MouseEvent;
})();

window.uiTypes.canvas.Shape = (function(){
    var Shape = function(rect, renderer){
        this.m_rect = rect;
        this.m_renderer = renderer;
    };

    Shape.prototype.hitTest = function (point, event) {
        return window.generic.IsPointInRect(point, this.m_rect) ? this : false;
    };

    return Shape;
})();

window.uiTypes.canvas.Button = (function(){
    var Button = function(rect, renderer) {
        Button.superclass.constructor.call(this, rect, renderer);

        this.m_frameSize = 0;
        this.m_roundedCornerRadius = 0;
        this.m_backgroundColor = remoteColors.scrollBar.backgroundColor;
        this.m_backgroundColorPressed = remoteColors.scrollBar.backgroundColorPressed;
        this.m_strokeColor = remoteColors.scrollBar.strokeColor;
        this.m_pressed = 0;
        this.m_over = 0;
        this.m_pressedCallback = 0;
        this.m_moveCallback = 0;
        this.m_releaseCallback = 0;
        this.m_arrowLineWidth = 3;
    }
    window.generic.extend(Button, window.uiTypes.canvas.Shape);
    Button.prototype.draw = function () {
        this.m_renderer.drawRect(this.m_rect, this.m_strokeColor, this.m_frameSize, (this.m_pressed && this.m_over) ? this.m_backgroundColorPressed : this.m_backgroundColor, this.m_roundedCornerRadius);
    }
    Button.prototype.hitTest = function (point, event) {
        var result = Button.superclass.hitTest.call(this, point, event);
        this.m_over = result;
        if (event.up) {
            this.m_pressed = false;
            if (this.m_releaseCallback) {
                this.m_releaseCallback(point);
            }
        } else if (result && event.down) {
            this.m_pressed = true;
            this.m_pressPoint = point;
            if (this.m_pressedCallback) {
                this.m_pressedCallback(point);
            }
        }

        if (this.m_pressed && event.move) {
            if (this.m_moveCallback) {
                this.m_moveCallback(point);
            }
        }

        return result;
    }
    return Button;
})();

window.uiTypes.canvas.Arrow = (function(){
    var Arrow = function(rect, direction, renderer) {
        Arrow.superclass.constructor.call(this, rect, renderer);

        this.m_direction = direction;
    }
    window.generic.extend(Arrow, window.uiTypes.canvas.Button);

    //   P0------P1------P2
    //   |                |
    //   |                |
    //   P3               P4
    //   |                |
    //   |                |
    //   P5------P6------P7
    var directionToPoints = {
        "up": [5, 1, 7],
        "down": [0, 6, 2],
        "left": [2, 3, 7],
        "right": [0, 4, 5]
    };

    Arrow.prototype.draw = function () {
        Arrow.superclass.draw.call(this);
        var border = this.m_rect.width * 0.3;
        var points = [
            {
                x: this.m_rect.left + border,
                y: this.m_rect.top + border
            },
            {
                x: this.m_rect.left + (this.m_rect.width / 2),
                y: this.m_rect.top + border
            },
            {
                x: this.m_rect.left + (this.m_rect.width - border),
                y: this.m_rect.top + border
            },
            {
                x: this.m_rect.left + border,
                y: this.m_rect.top + (this.m_rect.height / 2)
            },
            {
                x: this.m_rect.left + (this.m_rect.width - border),
                y: this.m_rect.top + (this.m_rect.height / 2)
            },
            {
                x : this.m_rect.left + border,
                y : this.m_rect.top + this.m_rect.width - border
            },
            {
                x: this.m_rect.left + (this.m_rect.width / 2),
                y: this.m_rect.top + this.m_rect.height - border
            },
            {
                x: this.m_rect.left + (this.m_rect.width - border),
                y: this.m_rect.top + this.m_rect.height - border
            }
        ];

        this.m_renderer.drawLines([
            points[directionToPoints[this.m_direction][0]],
            points[directionToPoints[this.m_direction][1]],
            points[directionToPoints[this.m_direction][2]]
        ], this.m_strokeColor, 0, this.m_arrowLineWidth);
    };

    return Arrow;
})();

window.uiTypes.canvas.Caret = (function(){
    var Caret = function(rect, from, to, renderer) {
        Caret.superclass.constructor.call(this, rect, renderer);
    }
    window.generic.extend(Caret, window.uiTypes.canvas.Button);

    return Caret;
})();

window.uiTypes.canvas.ScrollBar = (function(){
    var ScrollBar = function(rect, parent, inverted, renderer) {
        var self = this;
        ScrollBar.superclass.constructor.call(this, rect, renderer);

        this.m_defaultSettings = {
            defaultWheelCoef : 10,
            roundedCornerRadius : 0,
            backgroundColor : remoteColors.scrollBar.backgroundColor,
            frameSize:0,
            strokeColor: remoteColors.scrollBar.strokeColor,
            minCaretBreadth: 50,
            visible: true
        };
        this.m_parent = parent;

        this.m_offset = 0;
        this.m_inverted = inverted;

        this.m_arrowBack = 0;
        this.m_caret = 0;
        this.m_arrowForward = 0;

        this.m_caretPressedPoint = 0;
        this.m_caretPressedOffset = 0;

        this.stepCallback = 0;
        this.stepPageCallback = 0;
        this.wheelStartCallback = 0;
        this.wheelCallback = 0;
        this.wheelEndCallback = 0;

        this.init = function () {
            this.m_arrowBack = new window.uiTypes.canvas.Arrow(this.GetBackArrowRect(), this.backArrowName, this.m_renderer);
            this.m_arrowBack.m_pressedCallback = (function () { this.step("back"); }).bind(this);
            this.m_caret = new window.uiTypes.canvas.Caret(this.GetCaretRect(), 0, 0, this.m_renderer);
            this.m_caret.m_pressedCallback = (function (point) { this.m_caretPressedPoint = point; this.m_caretPressedOffset = this.GetOffset();  if(this.wheelStartCallback){this.wheelStartCallback();}}).bind(this);
            this.m_caret.m_moveCallback = (function (point) { this.dragCaret(point); }).bind(this);
            this.m_caret.m_releaseCallback = (function (point) { this.m_caretPressedPoint = 0; this.m_caretPressedOffset = 0; if(this.wheelEndCallback) {this.wheelEndCallback();}}).bind(this);
            this.m_arrowForward = new window.uiTypes.canvas.Arrow(this.GetForwardArrowRect(), this.forwardArrowName, this.m_renderer);
            this.m_arrowForward.m_pressedCallback = function () { self.step("forward"); };
        }
        this.setColorSettings = function (data) {
            if (data.roundedCornerRadius) {
                this.m_arrowForward.m_roundedCornerRadius = this.m_caret.m_roundedCornerRadius = this.m_arrowBack.m_roundedCornerRadius = this.m_defaultSettings.roundedCornerRadius = data.roundedCornerRadius;
            }
            if (data.backgroundColor) {
                this.m_defaultSettings.backgroundColor = data.backgroundColor;
            }
            if (data.buttonsBackgroundColor) {
                this.m_arrowForward.m_backgroundColor = this.m_caret.m_backgroundColor = this.m_arrowBack.m_backgroundColor = data.buttonsBackgroundColor;
            }
            if (data.buttonsPresedBackgroundColor) {
                this.m_arrowForward.m_backgroundColorPressed = this.m_caret.m_backgroundColorPressed = this.m_arrowBack.m_backgroundColorPressed = data.buttonsPresedBackgroundColor;
            }
            if (data.frameSize) {
                this.m_arrowForward.m_frameSize = this.m_caret.m_frameSize = this.m_arrowBack.m_frameSize = this.m_defaultSettings.frameSize = data.frameSize;
            }
            if (data.strokeColor) {
                this.m_arrowForward.m_strokeColor = this.m_caret.m_strokeColor = this.m_arrowBack.m_strokeColor = this.m_defaultSettings.strokeColor = data.strokeColor;
            }
        }

        this.hitTest = function (point, event) {
            if (this.m_defaultSettings.visible) {
                var result = ScrollBar.superclass.hitTest.call(this, point, event);

                if (result) {
                    result = this.m_arrowBack.hitTest(point, event) || this.m_caret.hitTest(point, event) || this.m_arrowForward.hitTest(point, event);
                    if (!result && event.down) {
                        if (window.generic.IsPointInRect(point, this.GetBeforeCaretRect())) {
                            this.stepPage("back");
                        }
                        else { // if window.generic.IsPointInRect(point, this.GetAfterCaretRect())
                            this.stepPage("forward");
                        }
                    }
                }
                return result;
            }
            return false;
        }
        this.draw = function () {
            if (this.m_defaultSettings.visible) {
                this.m_renderer.drawRect(this.m_rect, this.m_defaultSettings.strokeColor, this.m_defaultSettings.frameSize, this.m_defaultSettings.backgroundColor, this.m_defaultSettings.roundedCornerRadius);
                if(!isDot2())
                {
                    this.m_arrowBack.draw();
                }
                this.m_caret.draw();
                if(!isDot2())
                {
                    this.m_arrowForward.draw();
                }
            }
        }

        this.getDirection = function (direction) {
            if (this.m_inverted) {
                if (direction === "forward") {
                    return "back";
                } else if (direction === "back") {
                    return "forward";
                }
            }
            return direction;
        }

        this.step = function (direction) {
            if (this.stepCallback) {
                this.stepCallback(this.getDirection(direction));
            }
        }
        this.stepPage = function (direction) {
            if (this.stepPageCallback) {
                this.stepPageCallback(this.getDirection(direction));
            }
        }
        this.dragCaret = function (point) {
            var delta = {
                x: point.x - this.m_caretPressedPoint.x,
                y: point.y - this.m_caretPressedPoint.y
            };
            if (this.m_inverted) {
                delta.x = -delta.x;
                delta.y = -delta.y;
            }
            if (this.wheelCallback) {
                var scrollRange = this.GetCaretFieldLength() - this.GetCaretLength();
                if (scrollRange > 0) {
                    this.wheelCallback(this.GetDimensionValue(delta) / scrollRange);
                    //window.generic.statusLogging("wheel offset value: " + this.GetDimensionValue(delta) / scrollRange);
                }
            }
        }
        this.scroll = function (value) {
            if (!this.m_inverted) {
                value.x = -value.x;
                value.y = -value.y;
            }
            if (this.stepCallback) {
                var delta = this.GetDimensionValue(value);
                this.stepCallback(delta >= 0 ? "forward" : "back"); //, Math.abs(offset));
            }
        }
        this.GetOffset = function () {
            return this.m_offset;
        }
        this.SetOffset = function (offset) {
            if (this.m_inverted) {
                this.m_offset = 1 - (this.GetCaretFieldLength() - this.GetCaretLength()) * offset;
            } else {
                this.m_offset = (this.GetCaretFieldLength() - this.GetCaretLength()) * offset;
            }
            //window.generic.statusLogging("offset changed: " + this.m_offset);
        }
        this.GetVisible = function () {
            return this.m_defaultSettings.visible;
        }
        this.SetVisible = function (value) {
            if (this.m_defaultSettings.visible != value) {
                this.m_defaultSettings.visible = value;
                $.event.trigger({
                    type: ScrollBar.visibilityChangedEvent,
                    sender: this
                });
            }
        }
    };

    window.generic.extend(ScrollBar, window.uiTypes.canvas.Shape);
    ScrollBar.visibilityChangedEvent = "visibilityChanged";
    ScrollBar.prototype.resize = function (rect) {
        this.m_rect = rect;

        this.m_arrowBack.m_rect = this.GetBackArrowRect();
        this.m_caret.m_rect = this.GetCaretRect();
        this.m_arrowForward.m_rect = this.GetForwardArrowRect();
    };

    return ScrollBar;
})();

window.uiTypes.canvas.HorizontalScrollBar = (function(){

    var HorizontalScrollBar = function(rect, parent, renderer) {
        HorizontalScrollBar.superclass.constructor.call(this, rect, parent, 0, renderer);
        this.backArrowName = "left";
        this.forwardArrowName = "right";
    }
    window.generic.extend(HorizontalScrollBar, window.uiTypes.canvas.ScrollBar);
    HorizontalScrollBar.prototype.GetBackArrowRect = function() {
        var arrowWidth = this.m_rect.height;
        if(isDot2())
        {
            arrowWidth = 0;
        }
        return {
            top: this.m_rect.top,
            left: this.m_rect.left,
            width: arrowWidth,
            height: this.m_rect.height
        };
    }
    HorizontalScrollBar.prototype.GetBeforeCaretRect = function () {
        var arrowWidth = this.m_rect.height;
        if(isDot2())
        {
            arrowWidth = 0;
        }
        return {
            top: this.m_rect.top,
            left: this.m_rect.left + arrowWidth,
            width: this.m_offset,
            height: this.m_rect.height
        };
    }
    HorizontalScrollBar.prototype.GetCaretRect = function() {
        var arrowWidth = this.m_rect.height;
        if(isDot2())
        {
            arrowWidth = 0;
        }
        var widthPercent = Math.min(this.m_parent.GetVisibleScrollableWidth() / this.m_parent.GetFullScrollableWidth(), 1);
        return {
            top: this.m_rect.top,
            left: this.m_rect.left + arrowWidth + this.m_offset,
            width: Math.max(this.GetCaretFieldLength() * widthPercent, this.m_defaultSettings.minCaretBreadth),
            height: this.m_rect.height
        };
    }
    HorizontalScrollBar.prototype.GetAfterCaretRect = function () {
        var arrowWidth = this.m_rect.height;
        if(isDot2())
        {
            arrowWidth = 0;
        }
        var caretRect = this.GetCaretRect();
        return {
            top: this.m_rect.top,
            left: caretRect.left + caretRect.width,
            width: this.m_rect.width - (caretRect.left + caretRect.width) - arrowWidth,
            height: this.m_rect.height
        };
    }
    HorizontalScrollBar.prototype.GetForwardArrowRect = function () {
        var arrowWidth = this.m_rect.height;
        if(isDot2())
        {
            arrowWidth = 0;
        }
        return {
            top: this.m_rect.top,
            left: this.m_rect.left + this.m_rect.width - arrowWidth,
            width: arrowWidth,
            height: this.m_rect.height
        };
    }
    HorizontalScrollBar.prototype.GetCaretFieldLength = function () {
        var arrowWidth = this.m_rect.height;
        if(isDot2())
        {
            arrowWidth = 0;
        }
        return this.m_rect.width - 2 * arrowWidth;
    }
    HorizontalScrollBar.prototype.GetDimensionValue = function (point) {
        return point.x;
    }
    HorizontalScrollBar.prototype.GetCaretLength = function () {
        return this.GetCaretRect().width;
    }
    HorizontalScrollBar.prototype.GetBreadth = function () {
        return this.m_defaultSettings.visible ? this.m_rect.height : 0;
    }
    HorizontalScrollBar.prototype.resize = function (rect) {
        HorizontalScrollBar.superclass.resize.call(this, rect);

        if (this.m_parent.GetVisibleScrollableWidth() / this.m_parent.GetFullScrollableWidth() >= 1) {
            this.SetVisible(false);
        } else {
            this.SetVisible(true);
        }
    }

    return HorizontalScrollBar;
})();

window.uiTypes.canvas.VerticalScrollBar = (function(){
    var VerticalScrollBar = function(rect, parent, inverted, renderer) {
        VerticalScrollBar.superclass.constructor.call(this, rect, parent, inverted, renderer);
        this.backArrowName = "up";
        this.forwardArrowName = "down";
    }
    window.generic.extend(VerticalScrollBar, window.uiTypes.canvas.ScrollBar);
    VerticalScrollBar.prototype.GetBackArrowRect = function (recursionPreventer) {
        var arrowHeight = this.m_rect.width;
        if(isDot2())
        {
            arrowHeight = 0;
        }
        return {
            top: this.m_rect.top,
            left: this.m_rect.left,
            width: this.m_rect.width,
            height:arrowHeight
        };
    }
    VerticalScrollBar.prototype.GetBeforeCaretRect = function () {
        var arrowHeight = this.m_rect.width;
        if(isDot2())
        {
            arrowHeight = 0;
        }
        return {
            top: this.m_rect.top + arrowHeight,
            left: this.m_rect.left,
            width: this.m_rect.width,
            height: this.m_offset
        };
    }
    VerticalScrollBar.prototype.GetCaretRect = function () {
        var arrowHeight = this.m_rect.width;
        if(isDot2())
        {
            arrowHeight = 0;
        }
        var scrollableHeightPercent = Math.min(1, (this.m_parent.GetVisibleScrollableHeight() / this.m_parent.GetFullScrollableHeight()));
        var height = Math.max(parseInt(this.GetCaretFieldLength() * scrollableHeightPercent), this.m_defaultSettings.minCaretBreadth);
        return {
            top:(this.m_inverted ? (this.m_rect.top + this.m_rect.height - arrowHeight + this.m_offset - height) : this.m_rect.top + arrowHeight + this.m_offset),
            left:this.m_rect.left,
            width:this.m_rect.width,
            height: height
        };
    }
    VerticalScrollBar.prototype.GetAfterCaretRect = function () {
        var arrowHeight = this.m_rect.width;
        if(isDot2())
        {
            arrowHeight = 0;
        }
        var caretRect = this.GetCaretRect();
        return {
            top: caretRect.top + caretRect.height,
            left: this.m_rect.left,
            width: this.m_rect.width,
            height: this.m_rect.height - (caretRect.top + caretRect.height) - arrowHeight
        };
    }
    VerticalScrollBar.prototype.GetForwardArrowRect = function (recursionPreventer) {
        var arrowHeight = this.m_rect.width;
        if(isDot2())
        {
            arrowHeight = 0;
        }
        return {
            top:this.m_rect.top + this.m_rect.height - arrowHeight,
            left:this.m_rect.left,
            width:this.m_rect.width,
            height:arrowHeight
        };
    }
    VerticalScrollBar.prototype.GetCaretFieldLength = function () {
        var arrowHeight = this.m_rect.width;
        if(isDot2())
        {
            arrowHeight = 0;
        }
        return this.m_rect.height - 2 * arrowHeight;
    }
    VerticalScrollBar.prototype.GetDimensionValue = function (point) {
        return point.y;
    }
    VerticalScrollBar.prototype.GetCaretLength = function () {
        return this.GetCaretRect().height;
    }
    VerticalScrollBar.prototype.GetBreadth = function () {
        return this.m_defaultSettings.visible ? this.m_rect.width : 0;
    }
    VerticalScrollBar.prototype.resize = function (rect) {
        VerticalScrollBar.superclass.resize.call(this, rect);

        if (this.m_parent.GetVisibleScrollableHeight() / this.m_parent.GetFullScrollableHeight() >= 1) {
            this.SetVisible(false);
        } else {
            this.SetVisible(true);
        }
    }
    return VerticalScrollBar;
})();
