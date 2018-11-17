window.uiTypes.canvas.MA2Window = (function(){
    var MA2Window = function (parentElement, renderer, rect, dispatcher) {
        this.m_defaultSettings = {
            roundedCornerRadius: 8,
            backgroundColor: remoteColors.ma2Window.backgroundColor,
            buttonsBackgroundColor: remoteColors.ma2Window.buttonsBackgroundColor,
            frameSize: 2,
            strokeColor: remoteColors.ma2Window.strokeColor,
            maxScrollBreadth: 50,
            minScrollBreadth: 30,
            scrollBreadth: 45
        };
        if(isDot2())
        {
            this.m_defaultSettings.scrollBreadth = 30;
            this.m_defaultSettings.roundedCornerRadius = 0;
        }
        this.m_rect = rect;
        this.m_parent = parentElement;
        this.m_parentPureDOMElement = parentElement[0];
        this.renderer = renderer;
        this.m_dispatcher = dispatcher;

        var m_horizontalScroll = 0;
        var m_verticalScroll = 0;

        var m_capturedElement = 0;

        this.m_redrawWholeCanvas = true;

        /* Get/Set */
        this.GetHScroll = function () {
            return m_horizontalScroll;
        }
        this.SetHScroll = function (value) {
            m_horizontalScroll = value;
        }
        this.GetVScroll = function () {
            return m_verticalScroll;
        }
        this.SetVScroll = function (value) {
            m_verticalScroll = value;
        }
        /* End Get/Set */

        this.scroll = function (event) {
            if (!event.ctrlKey) {
                m_verticalScroll.scroll({ x: event.deltaX, y: event.deltaY });
            }
        }

        this.GetHScrollRect = function () {
            var contentRect = this.GetContentRect();
            return {
                top: this.m_rect.top + contentRect.height,
                left: this.m_rect.left,
                width: this.m_rect.width,
                height: this.m_defaultSettings.scrollBreadth
            };
        }
        this.GetVScrollRect = function () {
            var contentRect = this.GetContentRect();
            return {
                top: this.m_rect.top,
                left: this.m_rect.left + contentRect.width,
                width: this.m_defaultSettings.scrollBreadth,
                height: contentRect.height
            };
        }
        this.GetContentRect = function () {
            return {
                x: this.m_rect.left,
                y: this.m_rect.top,
                top: this.m_rect.top,
                left: this.m_rect.left,
                width: this.m_rect.width - (this.GetVScroll() ? this.GetVScroll().GetBreadth() : this.m_defaultSettings.scrollBreadth) - this.m_rect.left,
                height: this.m_rect.height - (this.GetHScroll() ? this.GetHScroll().GetBreadth() : this.m_defaultSettings.scrollBreadth) - this.m_rect.top
            };
        }

        this.press = function (event) {
            var eventPoint = window.generic.GetEventPoint(event);
            var parentOffset = parentElement.offset();
            eventPoint.x -= parentOffset.left;
            eventPoint.y -= parentOffset.top;
            m_capturedElement = this.hitTestWindow(eventPoint, { up: false, down: true, move: false });
        }
        this.release = function (event) {
            var eventPoint = window.generic.GetEventPoint(event);
            var parentOffset = parentElement.offset();
            eventPoint.x -= parentOffset.left;
            eventPoint.y -= parentOffset.top;
            if (m_capturedElement) {
                m_capturedElement.hitTest(eventPoint, { up: true, down: false, move: false });
            } else {
                this.hitTestWindow(eventPoint, { up: true, down: false, move: false });
            }

            m_capturedElement = false;
        }
        this.over = function (event) {
            var eventPoint = window.generic.GetEventPoint(event);
            var parentOffset = parentElement.offset();
            eventPoint.x -= parentOffset.left;
            eventPoint.y -= parentOffset.top;
            this.hitTestWindow(eventPoint, { up: false, down: false, move: false, over: true });
        }
        this.move = function (event) {
            var eventPoint = window.generic.GetEventPoint(event);
            var parentOffset = parentElement.offset();
            eventPoint.x -= parentOffset.left;
            eventPoint.y -= parentOffset.top;
            if (m_capturedElement) {
                m_capturedElement.hitTest(eventPoint, { up: false, down: false, move: true });
            }
            else {
                this.hitTestWindow(eventPoint, { up: false, down: false, move: true });
            }
        }
        this.scrollVisibilityChangedHandler = function (event) {
            if (event.sender == this.GetHScroll()) {
                this.GetVScroll().resize(this.GetVScrollRect());
            } else if (event.sender == this.GetVScroll()) {
                this.GetHScroll().resize(this.GetHScrollRect());
            }
        };
        this.hitTestWindow = function (point, event) {
            return this.hitTest(point, event) || m_horizontalScroll.hitTest(point, event) || m_verticalScroll.hitTest(point, event);
        }

        this.SetHScrollVisible = function (value) {
            var hScroll = this.GetHScroll();
            var vScroll = this.GetVScroll();
            var currentVisibleState = hScroll.GetVisible();
            if (currentVisibleState != value) {
                hScroll.SetVisible(value);
                if (vScroll.GetVisible()) {
                    vScroll.resize(this.GetVScrollRect());
                }
            }
        }
        this.SetVScrollVisible = function (value) {
            var hScroll = this.GetHScroll();
            var vScroll = this.GetVScroll();
            var currentVisibleState = vScroll.GetVisible();
            if (currentVisibleState != value) {
                vScroll.SetVisible(value);
                if (hScroll.GetVisible()) {
                    hScroll.resize(this.GetHScrollRect());
                }
            }
        }

        this.press_context = this.press.bind(this);
        this.move_context = this.move.bind(this);
        this.release_context = this.release.bind(this);
        this.over_context = this.over.bind(this);
        this.scroll_context = this.scroll.bind(this);
        this.m_scrollVisibilityChangedHandler_context = this.scrollVisibilityChangedHandler.bind(this);
    }
    MA2Window.prototype.init = function (invertVerticalScroll) {
        if(!isDot2())
        {
            this.m_defaultSettings.scrollBreadth = Math.min(Math.max(this.m_parent.width() / 100 * 2, this.m_defaultSettings.minScrollBreadth), this.m_defaultSettings.maxScrollBreadth);
        }

        this.m_parentPureDOMElement.addEventListener(Touch.maTouchDown, this.press_context);
        this.m_parentPureDOMElement.addEventListener(Touch.maTouchMove, this.move_context);
        this.m_parentPureDOMElement.addEventListener(Touch.maTouchUp, this.release_context);
        this.m_parentPureDOMElement.addEventListener(Touch.maTouchOver, this.over_context);

        this.SetHScroll(new window.uiTypes.canvas.HorizontalScrollBar(this.GetHScrollRect(), this, this.renderer));
        var hScroll = this.GetHScroll();
        hScroll.stepCallback = this.hStep.bind(this);
        hScroll.stepPageCallback = this.hStepPage.bind(this);
        hScroll.wheelStartCallback = this.wheelStart.bind(this);
        hScroll.wheelCallback = this.hWheel.bind(this);
        hScroll.wheelEndCallback = this.wheelEnd.bind(this);
        hScroll.init();
        hScroll.setColorSettings(this.m_defaultSettings);

        this.SetVScroll(new window.uiTypes.canvas.VerticalScrollBar(this.GetVScrollRect(), this, invertVerticalScroll, this.renderer));
        var vScroll = this.GetVScroll();
        vScroll.stepCallback = this.vStep.bind(this);
        vScroll.stepPageCallback = this.vStepPage.bind(this);
        vScroll.wheelStartCallback = this.wheelStart.bind(this);
        vScroll.wheelCallback = this.vWheel.bind(this);
        vScroll.wheelEndCallback = this.wheelEnd.bind(this);
        vScroll.init();
        vScroll.setColorSettings(this.m_defaultSettings);

        $(this.m_parentPureDOMElement).on('mousewheel', this.scroll_context);
        document.addEventListener(window.uiTypes.canvas.ScrollBar.visibilityChangedEvent, this.m_scrollVisibilityChangedHandler_context);
    }
    MA2Window.prototype.refresh = function () {
        if (this.m_redrawWholeCanvas) {
            this.renderer.drawRect(this.m_rect, 0, 0, this.m_defaultSettings.fillStyle);
        }
    }
    MA2Window.prototype.hitTest = function (point, event) {
        var result = window.generic.IsPointInRect(point, this.GetContentRect()) ? this : false;
        //window.generic.statusLogging("Content (x,y) " + point.x + ", " + point.y + "; event: move - " + event.move + ", down - " + event.down + ", up - " + event.up);
        return result;
    }
    MA2Window.prototype.resize = function (rect, _init) {
        this.m_rect = rect;

        if(!isDot2())
        {
            this.m_defaultSettings.scrollBreadth = Math.min(Math.max(this.m_parent.width() / 100 * 2, this.m_defaultSettings.minScrollBreadth), this.m_defaultSettings.maxScrollBreadth);
        }
        this.GetHScroll().resize(this.GetHScrollRect());
        this.GetVScroll().resize(this.GetVScrollRect());

        this.m_redrawWholeCanvas = true;
    }
    MA2Window.prototype.getSize = function () {
        return this.m_rect;
    };
    MA2Window.prototype.drawScrollBars = function () {
        this.GetHScroll().resize(this.GetHScrollRect());
        this.GetVScroll().resize(this.GetVScrollRect());

        this.GetHScroll().draw(this.renderer);
        this.GetVScroll().draw(this.renderer);
    };
    MA2Window.prototype.setConfig = function(config) {
        $.extend(this.m_defaultSettings, config);
    };
    MA2Window.prototype.Close = function () {
        this.m_parentPureDOMElement.removeEventListener(Touch.maTouchDown, this.press_context);
        this.m_parentPureDOMElement.removeEventListener(Touch.maTouchMove, this.move_context);
        this.m_parentPureDOMElement.removeEventListener(Touch.maTouchUp, this.release_context);
        $(this.m_parentPureDOMElement).on('mousewheel', this.scroll_context);
        document.removeEventListener(window.uiTypes.canvas.ScrollBar.visibilityChangedEvent, this.m_scrollVisibilityChangedHandler_context);
    }

    return MA2Window;
})();
