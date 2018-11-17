(function () {
    window.defineNamespace = function(context, name){
        var sections = name.split(".");
        for (var i = 0; i < sections.length; i++) {
            if(!context[sections[i]]){
                context[sections[i]] = {};
            }
            context = context[sections[i]];
        }
    };

    window.assert = function (condition, message, _throw) {
        if (!condition) {
            var currentdate = new Date();
            console.log("[" + currentdate.toLocaleTimeString() + "] - " + message);
            if (_throw) {
                throw new Error(message);
            }
        }
    };

    window.log = function (message) {
        if(window.applicationType == "debug")
        {
            var currentdate = new Date();
            console.log("[" + currentdate.toLocaleTimeString() + "] - " + message);
        }
    };

    window.warning = function (message) {
        if(window.applicationType == "debug")
        {
            var currentdate = new Date();
            console.warn("[" + currentdate.toLocaleTimeString() + "] - " + message);
        }
    };

    window.error = function (message) {
        var currentdate = new Date();
        console.error("[" + currentdate.toLocaleTimeString() + "] - " + message);
    };

    window.isDot2 = function()
    {
        return localStorage.getItem("appType") == "dot2";
    }
})();

defineNamespace(window, "generic.globs");
(function (ns) {
    ns.globs.epsylon = 0.00001;

    ns.statusLogging = function (message) {
        if(window.applicationType == "debug")
        {
            var currentdate = new Date();
            message = "[" + currentdate.toLocaleTimeString() + "] - " + message;
            if (console && console.log) {
                console.log(message);
            }
        }
    };
})(window.generic);

defineNamespace(window, "ui");
defineNamespace(window, "uiTypes.canvas");
defineNamespace(window, "tools");
defineNamespace(window, "login");

(function () {
    var array = [];

    window.generic.slice = array.slice;
    window.generic.sign = function (value) {
        if (Math.sign) {
            return Math.sign(value);
        }

        return Math.abs(value) / value;
    }

    window.generic.createGuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };
})();

window.generic.globs.$window = $(window);
window.generic.globs.$body = $("body");
window.generic.globs.$document = $(document);
// window.generic.globs.$document.bind("contextmenu", function(e){
//     e.preventDefault();
// });
//////////////////////////////////////////////////////////////////////////

defineNamespace(window, "utilities");
(function(ns){

    var math = {};

    math.round = function(value){
        return Math.round(value);
    };

    math.ceil = function(value){
        return Math.ceil(value);
    };

    math.floor = function(value){
        return Math.floor(value);
    };

    math.roundPoint = function(point){
        return {
            x: math.round(point.x),
            y: math.round(point.y)
        };
    };

    math.roundPoints = function(points){
        for (var i = 0; i < points.length; i++) {
            points[i] = math.roundPoint(points[i]);
        }
        return points;
    };

    math.roundRect = function(rect){
        return {
            x: math.round(rect.x),
            y: math.round(rect.y),
            width: math.round(rect.width),
            height: math.round(rect.height)
        };
    };

    math.roundRadius = function(radius){
        return {
            topLeft: math.round(radius.topLeft),
            topRight: math.round(radius.topRight),
            bottomLeft: math.round(radius.bottomLeft),
            bottomRight: math.round(radius.bottomRight)
        };
    };

    math.getMinMax = function(v1, v2) {
        if (v1 < v2) {
            return {
                max: v2,
                min: v1
            };
        } else {
            return {
                max: v1,
                min: v2
            };
        }
    };

    math.formatMinDigits = function (value, minDigits) {
        var valueText = value + "";
        for (var i = valueText.length; i < minDigits; i++) {
            valueText = "0" + valueText;
        }
        return valueText;
    };

    ns.math = math;

})(window.utilities);

(function(ns) {
    var start;
    var end;

    ns.performance = {
        start: function() {
            if (window.performance != undefined) {
                start = window.performance.now();
            } else {
                start = new Date().getMilliseconds();
            }
        },
        end: function() {
            if (window.performance != undefined) {
                end = window.performance.now();
            } else {
                end = new Date().getMilliseconds();
            }
            document.querySelector(".debug").textContent = "Render time: " + (end - start).toFixed(2) + "ms, " + (1000 / (end - start)).toFixed(2) + " fps";
        }
    };
})(window.utilities);


(function (ns) {
    ns.emptyFunction = function () {

    };

    ns.hasChanged = function (obj1, propNameSrc, obj2, propNameDest) {
        propNameDest = propNameDest || propNameSrc;

        if (!obj1 || !obj2) {
            if (!obj1 && !obj2) {
                return false;
            }

            return true;
        }

        return obj1[propNameSrc] !== obj2[propNameDest];
    };

    ns.checkAndSet = function (src, propNameSrc, dest, propNameDest, defaultValue) {
        defaultValue = defaultValue === undefined ? "" : defaultValue;
        propNameDest = propNameDest || propNameSrc;

        if (!src) {
            if (!dest) {
                assert(false, "window.utilities.checkAndSet: source and destination objects are both null!!!");
                return false;
            }

            if (dest[propNameDest] === defaultValue) {
                return false;
            }

            dest[propNameDest] = defaultValue;
            return true;
        }

        var srcValue = src[propNameSrc] || defaultValue;
        var destValue = dest[propNameDest];
        var changed = false;
        if (srcValue !== destValue) {
            dest[propNameDest] = srcValue;
            changed = true;
        }

        return changed;
    };
})(window.utilities);
