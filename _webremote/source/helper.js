defineNamespace(window, "utility");

(function ($) {
    $.events = function (expr) {
        var rez = [], evo;
        $(expr).each(function () {
            if (evo = $._data(this, "events")){
                rez.push({ element: this, events: evo });
            }
        });
        return rez.length > 0 ? rez : null;
    }
} (jQuery));

(function ($, ns) {
    $.fn.isVisible = function () {
        return $(this).css("display") != "none";
    }

    $.fn.setVisible = function () {
        return $(this).css("visibility", "visible");
    }

    $.fn.setInvisible = function () {
        return $(this).css("visibility", "hidden");
    }

    $.fn.applyTransform = function(transformation) {
        return $(this).css({'-webkit-transform' : transformation,
                     '-moz-transform' : transformation,
                     '-ms-transform' : transformation,
                     'transform' : transformation});
    }

    $.getOrCreate = function (id, className, html, parent) {
        html = html || "<div></div>";
        parent = parent || window.generic.globs.$body;
        var element = $("#" + id);
        if (!(0 in element)) {
            element = $(html);
            element.attr("id", id);
            element.addClass(className);
            parent.append(element);
        };
        return element;
    }

    $.createBlock = function (){
        return $("<div></div>");
    }

// data
// {
//     id : ,
//     className : ,
//     html : ,
//     parent :
// }
    $.createItem = function (data) {
        data.html = data.html || "<div></div>";
        element = $(data.html);
        if (data.id) {
            element.attr("id", data.id);
        };
        if (data.class) {
            element.addClass(data.class);
        };
        if (data.parent) {
            data.parent.append(element);
        };
        return element;
    }

// data
// {
//     id : ,
//     className : ,
//     html : ,
//     parent :
// }
    ns.createItem = function (data) { // TODO
        /*var root = document.createElement("div");
        if (data.html) {
            root.innerHTML = data.html;
            var tmp = root;
            root = root.childNodes;
        }
        //data.html = data.html || "<div></div>";
        //element = $(data.html);
        if (data.id) {
            root.attr("id", data.id);
        };
        if (data.class) {
            element.addClass(data.class);
        };
        if (data.parent) {
            data.parent.append(element);
        };
        return element;*/
    };

    ns.getDefaultFontSize = function() {
        return parseInt(window.generic.globs.$body.css("font-size"));
    };

    $.consoleStringToHTML = function (text) {
        return !text ? "" : text.replace("|", "<br/>");
    }

    $.normalizeConsoleString = function (text) {
        return !text ? "" : text.replace("|", "\n");
    }
} (jQuery, window.utility));

window.uiTypes.SelectionOverlay = function(borders, parentElement) {
    var m_borders = borders;
    var selectionOverlay = $(".selectionOverlay");
    var m_startPoint;
    var m_endPoint;
    var m_isActive = false;
    var m_parent = parentElement;

    var m_hDirection = null;
    var m_vDirection = null;

    function CheckFitToBorders(point) {
        var result = FitToBorders(point);

        return (result.x == point.x) && (result.y == point.y);
    }

    function FitToBorders(point) {
        var result = { x: point.x, y: point.y };

        result.x = Math.max(result.x, m_borders.left);
        result.x = Math.min(result.x, m_borders.left + m_borders.width);

        result.y = Math.max(result.y, m_borders.top);
        result.y = Math.min(result.y, m_borders.top + m_borders.height);

        return result;
    }

    this.setBorders = function (borders) {
        m_borders = borders;
    }

    this.setParent = function (parent) {
        m_parent = parent;
    }

    this.init = function (startX, startY) {
        var startPoint = { x: startX, y: startY };
        m_isActive = CheckFitToBorders(startPoint);
        if (m_isActive) {
            m_endPoint = m_startPoint = FitToBorders({ x: startX, y: startY });
            isActive = (startX == m_startPoint.x) && (startY == m_startPoint.y);

            selectionOverlay.css("width", 0);
            selectionOverlay.css("height", 0);
            var parentOffset = m_parent.offset();
            selectionOverlay.css("top", parentOffset.top + m_startPoint.y);
            selectionOverlay.css("left", parentOffset.left + m_startPoint.x);

            selectionOverlay.show();
        }
    }

    this.expand = function (newX, newY) {
        if (m_isActive) {
            m_endPoint = FitToBorders({ x: newX, y: newY });

            var left = Math.min(m_startPoint.x, m_endPoint.x);
            var top = Math.min(m_startPoint.y, m_endPoint.y);

            var width = Math.abs(m_startPoint.x - m_endPoint.x);
            var height = Math.abs(m_startPoint.y - m_endPoint.y);

            var parentOffset = m_parent.offset();
            selectionOverlay.css("top", parentOffset.top + top);
            selectionOverlay.css("left", parentOffset.left + left);

            selectionOverlay.css("width", width);
            selectionOverlay.css("height", height);

            if (m_startPoint.x > m_endPoint.x) {
                m_hDirection = window.uiTypes.HorizontalDirection.RightToLeft;
            } else if (m_startPoint.x == m_endPoint.x) {
                m_hDirection = window.uiTypes.HorizontalDirection.None;
            } else {
                m_hDirection = window.uiTypes.HorizontalDirection.LeftToRight;
            }

            if (m_startPoint.y > m_endPoint.y) {
                m_vDirection = window.uiTypes.VerticalDirection.BottomToTop;
            } else if (m_startPoint.y == m_endPoint.y) {
                m_vDirection = window.uiTypes.VerticalDirection.None;
            } else {
                m_vDirection = window.uiTypes.VerticalDirection.TopToBottom;
            }
        }
    }

    this.getSize = function () {
        if (!m_isActive) {
            return 0;
        }
        return { startX: m_startPoint.x, startY: m_startPoint.y, endX: m_endPoint.x, endY: m_endPoint.y };
    }

    this.setBorders = function (rect) {
        m_borders = rect;
        this.Close();
    }

    this.getHDirection = function () {
        return m_hDirection;
    };

    this.getVDirection = function () {
        return m_vDirection;
    };

    this.Close = function () {
        selectionOverlay.hide();
        m_isActive = false;
    }
};
window.generic.globs.selectionOverlay = new window.uiTypes.SelectionOverlay();
window.uiTypes.HorizontalDirection = {
    None: 0,
    LeftToRight: 1,
    RightToLeft: 2
};

window.uiTypes.VerticalDirection = {
    None: 0,
    TopToBottom: 1,
    BottomToTop: 2
};

(function ($) {
    $.ButtonBlock = function(){}

    $.ButtonBlock.create = function (dataArray, columnsCount, $container, blockTemplate, arrowTemplate) {
        //$container.hide();

        // create blocks.Return value is the array of point { x,y }
        var blocks = createBlocksBase(dataArray.length, columnsCount);
        // add blocks to DOM
        addBlocks(blocks, dataArray, $container, blockTemplate);

        if (arrowTemplate) {
            // pivot point
            // - center
            // - border
            // - circle
            var pivotType = "border";
            // create arrows. Return value is array of angles between neighbor elements
            var arrows = createArrowsBase(blocks);
            for (var i = 0; i < arrows.length; ++i) {
                var arrow = getArrow(arrows[i], pivotType, blocks.array[i], blocks.array[i + 1] || blocks.array[0]);
                var $arrow = $(arrowTemplate);
                $arrow.css({ position: "absolute", left: arrow.startPoint.x * blocks.blockWidth + "%", top: arrow.startPoint.y * blocks.blockHeight + "%", width: "25px", height: "20px" });
                transformArrows($arrow, arrow.angle);

                $container.append($arrow);
            }
        }

        $container.show();
    }

    function createBlocksBase(elementsCount, columnsCount) {
        if ((columnsCount < 2) || !elementsCount) {
            return [];
        }

        while (elementsCount < (columnsCount * 2 - 1)) {
            --columnsCount;
        }

        var result = Array();
        var elementsLeft = elementsCount;
        var row = 0;
        var head = 0;

        // 1. The first line is always full. Add columnsCount elements
        for (var i = 0; i < columnsCount; i++) {
            result.push({ x: i, y: row });
        }
        ++row;
        head += columnsCount;
        elementsLeft -= columnsCount;

        // 2. Begin to add groups of 2 items: one further and one from the back, until (columnsCount - 1) or columnsCount items left
        for (var i = columnsCount, j = elementsCount - 1; elementsLeft > columnsCount; ++i, --j) {
            result[i] = { x: columnsCount - 1, y: row };
            result[j] = { x: 0, y: row };
            ++row;
            elementsLeft -= 2;
            ++head;
        }

        // 3. There are less than or equal to columnsCount elements. Lets fill the last line
        var offsetX = elementsLeft == columnsCount ? 0 : 0.5;
        for (var i = elementsLeft - 1; i >= 0; --i) {
            result[head] = { x: offsetX + i, y: row };
            ++head;
        }
        ++row;

        return { array: result, rows: row, columns: columnsCount, blockWidth: (100 / columnsCount), blockHeight: (100 / row) };
    }

    function addBlocks(blocks, dataArray, $container, blockTemplate){
        // adjust css of every block and container
        var blockOffset = (100 / blocks.columns) / 2;
        var blockWidthString = blocks.blockWidth + "%";
        var blockHeightString = blocks.blockHeight + "%";
        if(isDot2())
        {
            blockWidthString = "calc("+blocks.blockWidth + "% - 1px)";
            blockHeightString = "calc("+blocks.blockHeight + "% - 1px)";
        }
        for (var i = 0; i < dataArray.length; ++i) {
            var $block = blockTemplate.clone();
            $(".text", $block).text(dataArray[i].text);
            $block.css({ position: "absolute", width: blockWidthString, height: blockHeightString, top: blocks.array[i].y * blocks.blockHeight + "%", left: blocks.array[i].x * blocks.blockWidth + "%" });
            dataArray[i].bind($block);
            $container.append($block);
        }
    }

    function createArrowsBase(blocks) {
        var arrows = [];
        for (var i = 0; i < blocks.array.length; ++i) {
            var current = blocks.array[i];
            var next = blocks.array[i + 1] || blocks.array[0];

            var angle = 0; // arrow to the top;

            var xDiff = next.x - current.x;
            var yDiff = next.y - current.y;
            if (xDiff) {
                angle = window.generic.sign(xDiff) * 90;
            } else if (yDiff > 0) {
                angle = 180;
            } else if (yDiff < 0) {
                angle = 0;
            } else {
                // 2 blocks have equal coordinates. Something has gone wrong
                throw new Error();
            }

            var delta = xDiff && yDiff ? 90 / (Math.abs(xDiff) / Math.abs(yDiff) + 1) * window.generic.sign(-yDiff) : 0;
            angle += delta;
            arrows.push(angle);
        }
        return arrows;
    }

    function getArrow(angle, pivotType, currentBlock, nextBlock) {
        var angleNormalized = angle;
        if (angleNormalized > 180) {
            angleNormalized -= 360;
        } else if (angleNormalized <= -180) {
            angleNormalized += 360;
        }

        var direction = "";
        var relativeArrowStart = { x: 0, y: 0 };
        if (pivotType == "border") {
            if ((-45 <= angleNormalized) && (angleNormalized <= 45)) { // top
                relativeArrowStart.x = 0.5;
                direction = "top";
            } else if ((-135 <= angleNormalized) && (angleNormalized < -45)) { // left
                relativeArrowStart.y = 0.5;
                direction = "left";
            } else if ((45 < angleNormalized) && (angleNormalized <= 135)) { // right
                relativeArrowStart.x = 1;
                relativeArrowStart.y = 0.5;
                direction = "right";
            } else { // bottom
                relativeArrowStart.x = 0.5;
                relativeArrowStart.y = 1;
                direction = "bottom";
            }
        }

        var xDiff = currentBlock.x - nextBlock.x;
        if (direction == "top") {
            if (xDiff < -0.3) {
                // move arrow to the right corner of the block
                relativeArrowStart.x += 0.5;
            } else if (0.3 < xDiff) {
                // move arrow to the left corner of the block
                relativeArrowStart.x -= 0.5;
            }
        } else if (direction == "bottom") {
            if (xDiff < -0.5) {
                // move arrow to the right corner of the block
                relativeArrowStart.x += 0.5;
            } else if (0.5 < xDiff) {
                // move arrow to the left corner of the block
                relativeArrowStart.x -= 0.5;
            }
        }

        return { startPoint:{ x: relativeArrowStart.x + currentBlock.x, y: relativeArrowStart.y + currentBlock.y }, angle: angleNormalized};
    }

    function transformArrows($arrow, angle) {
        // 90 degrees because top is arrow position by default, but inner arrow image points to the right
        var normalizedAngle = angle - 90;
        var needRotation = normalizedAngle != 0;
        var transformation = 'translate(-50%, -50%) ' + ( needRotation ? ('rotate(' + normalizedAngle + 'deg)') : "");
        $arrow.applyTransform(transformation);
        if (needRotation) {
            $arrow.css({ '-webkit-transform-origin': '50% 50%',
                '-moz-transform-origin': '50% 50%',
                '-ms-transform-origin': '50% 50%',
                'transform-origin': '50% 50%'
            });
        }
    }
})(jQuery);


(function ($) {
    $.Layout = {};

    $.Layout.init = function () {
        $.Layout.navigationPanel = $(".header-left-bottom");
        $.Layout.cmdline = $(".header-left-top");
        $.Layout.header = $(".header");
        $.Layout.leftPanel = $(".middle-left");
        $.Layout.topRightButton = $(".header-right");
        $.Layout.dimmerWheel = $(".middle-right");
        $.Layout.pageContent = $(".middle");
        $.Layout.topButtons = $(".middle-center-top");
        $.Layout.bottomButtons = $(".footer");
    }

    $.Layout.hide = function (flag) {
        toggleDisplay(flag, false);
    }

    $.Layout.show = function (flag, force) {
        if (arguments.length <= 1) {
            force = true;
        } else {
            force = !!force;
        }
        toggleDisplay(flag, force);
    }

    $.Layout.setHidden = function (flag) {
        toggleVisibility(flag, false);
    }

    $.Layout.setVisible = function (flag) {
        toggleVisibility(flag, true);
    }

    function _do(flag, op, value) {
        var item = null;
        for (var key in flag) {
            if (flag[key]) {
                item = $.Layout[key];
                break;
            }
        }

        if (item) {
            op.call(item, value);
        } else {
            warning("$.Layout: invalid flag parameter " + flag);
        }
    }

    function toggleDisplay (flag, show) {
        _do(flag, setDisplay, show);
    }

    function toggleVisibility (flag, visible){
        _do(flag, setVisibility, visible);
    }

    function setDisplay(visible){
        this.toggleClass("hidden", !visible);
    }

    function setVisibility(value) {
        var isVisible = this.css("visibility") === "visible";
        if ((value && isVisible) || (!value && !isVisible)) {
            return;
        }

        if (value) {
            this.css("visibility", "visible");
        } else {
            this.css("visibility", "hidden");
        }
    }
})(jQuery);
//////////////////////////////////////////////////////////////////////////

//////////////////////////Polyfills///////////////////////////////////////
(function(){
    if (document.all && !window.setTimeout.isPolyfill) {
      var __nativeST__ = window.setTimeout;
      window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
        var aArgs = window.generic.slice.call(arguments, 2);
        return __nativeST__(vCallback instanceof Function ? function () {
          vCallback.apply(null, aArgs);
        } : vCallback, nDelay);
      };
      window.setTimeout.isPolyfill = true;
    }

    if (!Object.assign) {
        Object.assign = function assign(target, source) {
            for (var index = 1, key, src; index < arguments.length; ++index) {
                src = arguments[index];

                for (key in src) {
                    if (Object.prototype.hasOwnProperty.call(src, key)) {
                        target[key] = src[key];
                    }
                }
            }

            return target;
        };
    }

})();
//////////////////////////Polyfills///////////////////////////////////////

(function(generic){
    generic.BoundIncrement = function(value, from, to) {
        var res = value + 1;
        if (res > to - 1) {
            res = from;
        }
        return res;
    }

    generic.BoundDecrement = function(value, from, to) {
        var res = value - 1;
        if (res < from) {
            res = to - 1;
        }
        return res;
    }

    generic.IsPointInRect = function(point, rect) {
        return (point.x >= rect.left) && (point.x <= rect.left + rect.width) &&
            (point.y >= rect.top) && (point.y <= rect.top + rect.height);
    }

    generic.GetEventPoint = function (e) {
        var event = e.originalEvent || e;
        var touch;
        if (event.touches && event.touches.length > 0) {
            touch = event.touches[0];
        } else if (event.changedTouches) {
            touch = event.changedTouches[0];
        }
        return { x: event.dataOffsetX || event.pageX || (touch ? touch.pageX : 0), y: event.dataOffsetY || event.pageY || (touch ? touch.pageY : 0) };
    }

    generic.AssertIsFinite = function (value) {
        if (value == undefined) {
            return true;
        }
        if (!isFinite(value)) {
            throw Error();
        }
    }

    //////////////////////////////////////////////////////////////////////////
    //Inheritance
    //////////////////////////////////////////////////////////////////////////
    generic.createObject = function(proto) {
        function ctor() { }
        ctor.prototype = proto;
        return new ctor();
    }

    generic.extend = function(childClass, superClass) {
        F = function () { };
        F.prototype = superClass.prototype;
        childClass.prototype = new F();
        childClass.prototype.constructor = childClass;
        childClass.superclass = superClass.prototype;
    }
})(window.generic);
