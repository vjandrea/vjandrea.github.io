
window.uiTypes.DropDownButton = (function () {
    var GlobalTimers = window.timers.GlobalTimers;

    var DropDownButton = function(DOMElement) {
        var m_DOMElement = DOMElement;
        var m_pureDOMElement = m_DOMElement[0];
        var dropDownSign;
        var canExecuteDropDown;
        var canExecuteDropDown_lastState;

        var $containerWrapper = null;
        var $container;
        var createItem;

        var isVisible = false;
        var showList = false;

        var m_items;
        var m_rect;

        var eventHandlers = null;

        // {
        //     OnStart: event,
        //     OnMove: event,
        //     OnEnd: event,
        //     OnTap: event,
        //     canExecuteDropDown: function,
        //     $container: jquery object,
        //     createItem: function
        // }
        this.init = function (data) {
            var $button = $(".button-content", m_DOMElement);
            if (!(0 in $button)) {
                $button = $('<div class="button-content"><div class="content"></div></div>');
                DOMElement.append($button);
            }
            this.$title = $(".content", $button);

            $containerWrapper = $.createBlock();
            window.generic.globs.$body.append($containerWrapper);

            dropDownSign = $("*[data-rel=drop-down-sign]", m_DOMElement);
            canExecuteDropDown = data.canExecuteDropDown || function () { return true; };
            canExecuteDropDown_lastState = false;

            $container      = data.$container;
            $container.css({
                "position": "absolute",
                "top": "0",
                "left": "0"
            });
            createItem      = data.createItem;

            dropDownSign.hide();

            eventHandlers = {
                down : data.OnStart,
                up : data.OnEnd,
                move: data.OnMove,
                tap: data.OnTap,
                leave: function () {
                    if (canExecuteDropDown() && !isVisible) {
                        showList = true;
                    }
                },
                redraw : redraw.bind(this),
                resize : this.close
            };

            this.bind(eventHandlers);
        };

        this.bind = function(eventHandlers){
            m_pureDOMElement.addEventListener(Touch.maTouchDown, eventHandlers.down);
            m_pureDOMElement.addEventListener(Touch.maTouchMove, eventHandlers.move);
            m_pureDOMElement.addEventListener(Touch.maTouchUp, eventHandlers.up);
            m_pureDOMElement.addEventListener(Touch.maTouchTap, eventHandlers.tap);
            m_pureDOMElement.addEventListener(Touch.maTouchLeave, eventHandlers.leave);
            m_pureDOMElement.addEventListener(Touch.maLongTap, eventHandlers.leave);

            $(window).bind('resize', eventHandlers.resize);
            GlobalTimers.AddRefreshTimerEventHandler(eventHandlers.redraw);
        };

        this.unbind = function(eventHandlers){
            GlobalTimers.RemoveRefreshTimerEventHandler(eventHandlers.redraw);
            $(window).unbind('resize', eventHandlers.resize);

            m_pureDOMElement.removeEventListener(Touch.maTouchDown, eventHandlers.down);
            m_pureDOMElement.removeEventListener(Touch.maTouchMove, eventHandlers.move);
            m_pureDOMElement.removeEventListener(Touch.maTouchUp, eventHandlers.up);
            m_pureDOMElement.removeEventListener(Touch.maTouchTap, eventHandlers.tap);
            m_pureDOMElement.removeEventListener(Touch.maTouchLeave, eventHandlers.leave);
            m_pureDOMElement.removeEventListener(Touch.maLongTap, eventHandlers.leave);
        }

        function redraw() {
            if (showList) {
                showList = false;
                this.renderList();
                $.Popup.Show({
                    control: $containerWrapper,
                    onClose: function() {
                        isVisible = false;
                    }
                });
                isVisible = true;
            };

            if (canExecuteDropDown_lastState != canExecuteDropDown()) {
                canExecuteDropDown_lastState = !canExecuteDropDown_lastState;

                if (canExecuteDropDown_lastState) {
                    dropDownSign.show();
                } else {
                    dropDownSign.hide();
                }
            }
        }

        this.rename = function (newName) {
            this.$title.html(newName);
        };

        this.updateListData = function (items){
            m_items = items;
        };


        this.updateListRect = function (rect) {
            m_rect = rect;
        };

        this.renderList = function() {
            if (!m_items) {
                return;
            }
            var resetRect = false;
            if (!m_rect) {
                resetRect = true;
                m_rect = {
                    left: 0,
                    top: 0,
                    width: generic.globs.$body.width(),
                    height: generic.globs.$body.height(),
                }
            }
            $containerWrapper.setInvisible();
                var tempContainer = $("<div></div>").append($container.children());

                generic.globs.$body.append($container);
                $container.css({
                    "width": "",
                    "height": ""
                });
                var n_items = m_items.length;
                var $items = [];
                var mainElementOffset = m_DOMElement.offset();

                var itemRects = [];

                var fullHeight = 0;
                for (var i = 0; i < n_items; i++) {
                    var $item = createItem(m_items[i]);
                    $items.push($item);
                    $container.append($item);

                    itemRects.push({
                        width: $item.outerWidth(),
                        height: $item.outerHeight()
                    });

                    fullHeight += itemRects[i].height;
                }
                tempContainer.remove();

                var additionalWidth = parseInt($container.css("border-left-width")) + 1 + parseInt($container.css("border-right-width")) + 1;
                var additionalHeight = parseInt($container.css("border-top-width")) + 1 + parseInt($container.css("border-bottom-width")) + 1;

                var listRect = {
                    left : mainElementOffset.left - m_rect.left,
                    top : mainElementOffset.top + m_DOMElement.height() - m_rect.top
                };
                listRect.width = m_rect.width - listRect.left;
                var dropDownDirectionUp = (mainElementOffset.top - m_rect.top) > (m_rect.height - (mainElementOffset.top - m_rect.top) - m_DOMElement.height());
                if (dropDownDirectionUp) {
                    listRect.top = m_rect.height - (mainElementOffset.top - m_rect.top)/* - m_DOMElement.height()*/;
                }
                listRect.height = m_rect.height - listRect.top;
                listRect.fit = true;


                listRect = calculateListSize(itemRects, additionalWidth, additionalHeight, listRect);
                listRect.width = Math.max(listRect.width, m_DOMElement.width());

                var itemIndex = 0;
                $container.css("display", "table");
                for (var i = 0; (i < listRect.n_rows[0]) && (itemIndex < $items.length); i++) {
                    var acc = 0;

                    var $row = $("<div data-rel='drop-down-list-row'></div>");
                    $row.css("display", "table-row");

                    for (var j = 0; (j < listRect.n_columns) && (itemIndex < $items.length); j++, itemIndex++) {
                        var $item = $items[i + acc];
                        $item.css("display", "table-cell");
                        $row.append($item);
                        acc+=listRect.n_rows[j];
                    }

                    $container.append($row);
                }



                if (dropDownDirectionUp) {
                    listRect.top = m_rect.height - listRect.top - listRect.height;
                }

                $containerWrapper.css({
                    top : m_rect.top + listRect.top,
                    left : m_rect.left + listRect.left,
                    position: "absolute",
                    overflow: "auto"
                }).innerWidth(listRect.width).innerHeight(listRect.height);

                $container.css({
                    "width": "100%",
                    "height": "100%"
                });

                $containerWrapper.append($container);
            $containerWrapper.setVisible();

            if (resetRect) {
                m_rect = undefined;
            }
        };

        function calculateListSize (itemRects, additionalWidth, additionalHeight, listRect) {
            var result = listRect;
            var n_items = itemRects.length;
            var n_columns = 1;
            var size;
            while(true){
                size = getSize(itemRects, n_columns);
                size.width += additionalWidth;
                size.height += additionalHeight;
                var fitWidth = isFitWidth(size.width, result);
                var fitHeight = isFitHeight(size.height, result);

                if ((fitWidth >= 0) && (fitHeight >= 0)) {
                    break;
                };

                if (fitWidth < 0) {
                    // try to move left

                    if (Math.abs(fitWidth) <= result.left) { // Yes, there is enough space
                        result.left -= Math.abs(fitWidth); // now width is OK
                        if (fitHeight < 0) { // need to move up
                            var offsetTop = result.top - Math.abs(fitHeight);
                            result.top = Math.max(offsetTop, 0);
                            result.fit = offsetTop >= 0;
                        }
                    } else { // there is no space for so many columns
                        if (n_columns > 1) {
                            --n_columns;
                            size = getSize(itemRects, n_columns);
                            size.width += additionalWidth;
                            size.height += additionalHeight;
                            // now width is OK, height doesn't fit
                            fitHeight = isFitHeight(size.height, result);
                            // so only need to move up
                            var offsetTop = result.top - Math.abs(fitHeight);
                            result.top = Math.max(offsetTop, 0);
                            result.fit = offsetTop >= 0;
                        } else { // if there is only one wide column
                            result.left = 0;
                            result.fit = false;
                            if (fitHeight < 0) { // need to move up
                                var offsetTop = result.top - Math.abs(fitHeight);
                                result.top = Math.max(offsetTop, 0);
                            }
                        }
                    }
                    break;
                };

                ++n_columns;

                if (n_columns > n_items) { // items are  too high, but width is OK. So move up
                    var offsetTop = result.top - Math.abs(fitHeight);
                    result.top = Math.max(offsetTop, 0);
                    result.fit = offsetTop >= 0;
                    break;
                };
            }

            result.width = Math.min(size.width, m_rect.width);
            result.height = Math.min(size.height, m_rect.height);
            result.n_rows = size.n_rows;
            result.n_columns = n_columns;

            return result;
        }

        function isFitWidth (width, rect) {
            return rect.width - width;
        }

        function isFitHeight (height, rect) {
            return rect.height - height;
        }

        function getSize(items, n_columns) {
            var result = {width: 0, height:0};

            var n_rows = [];

            var minRowsInColumn = Math.floor(items.length / n_columns);

            for (var i = 0; i < n_columns; i++) {
                n_rows.push(minRowsInColumn);
            }

            for (var i = minRowsInColumn * n_columns, row = 0; i <  items.length; i++, row++) {
                 ++n_rows[row];
            }

            var itemIndex = 0;
            for (var j = 0; j < n_columns; j++) {
                var width = 0;
                var height = 0;
                for (var i = 0; i < n_rows[j]; i++, itemIndex++) {
                    if(items[itemIndex].width > width){
                        width = items[itemIndex].width;
                    }
                    height += items[itemIndex].height;
                }

                result.width += width;
                if (height > result.height) {
                    result.height = height;
                }
            }

            result.n_rows = n_rows;

            return result;
        }

        this.list = function () {
            return $container;
        };

        this.close = function () {
            if (isVisible) {
                $.Popup.Close($containerWrapper);
            }
        };

        this.dispose = function () {
            this.unbind(eventHandlers);

            this.close();
            $containerWrapper.remove();
        };
    }
    return DropDownButton;
})();
