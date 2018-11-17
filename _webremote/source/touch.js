defineNamespace(window, "ui");

(function ($, ns) {
    var _settings = {
        deltaMs: 300,
        preventDefaultEvent: false,
        moveDelta : 10
    };
    var $document = $(document);

    var iOS = false,
        iDevices = ['iPad', 'iPhone', 'iPod'];

    for (var i = 0 ; i < iDevices.length ; i++ ) {
        if (navigator.platform.indexOf(iDevices[i]) != -1) {
            iOS = true;
            break;
        }
    }

    var Touch = function(settings){
        $.extend(_settings, settings);
    };

    var subscribers = {};

    // input events
    Touch.startEvent = 'pointerdown';
    Touch.leaveEvent = 'pointerleave';
    Touch.moveEvent = 'pointermove';
    Touch.endEvent = 'pointerup';

    // output events
    Touch.maTouchDown = "maTouchDown";
    Touch.maTouchTap = "maTouchTap";
    Touch.maTouchUp = "maTouchUp";
    Touch.maTouchEnter = "maTouchEnter";
    Touch.maTouchMove = "maTouchMove";
    Touch.maTouchLeave = "maTouchLeave";
    Touch.maLongTap = "maLongTap";

    var supportedEventsNames = [Touch.maTouchDown, Touch.maTouchTap, Touch.maTouchUp, Touch.maTouchEnter, Touch.maTouchMove, Touch.maTouchLeave, Touch.maLongTap];
    var moveEventTriggers = [Touch.maTouchEnter, Touch.maTouchMove, Touch.maTouchLeave, Touch.maLongTap];

    var on = function($targets, settings){
        var localSettings = {
            itemMultitouch: false
        };

        $.extend(localSettings, settings);

        if (!Array.isArray($targets)) {
            $targets = [$targets];
        }

        $.each($targets, function(key, value){
            var target = value;

            if (target._maTouchEventsSubscription) {
                console.log("Touch: Element " + target + " was already subscribed");
                return;
            }

            target._maTouchEventsSubscription = true;

            var eventDatas = {};
            var eventStruct = {
                timer : 0,
                delta : 1,
                down : false,
                isOver : false,
                downPoint : 0,
                HandleUp: null,
                HandleMove: null
            };

            target.addEventListener(Touch.startEvent, HandleDown);

            function HandleDown(event){
                if (iOS) {
                    event.preventDefault();
                    localSettings.itemMultitouch = true;
                }

                var pointerId = event.pointerId;
                if(event.button !== 0){ // allow only left mouse button
                    return;
                }

                var eventDataLength = 0;
                for(var item in eventDatas){
                    ++eventDataLength;
                }

                //window.generic.statusLogging(eventDataLength);
                if (!localSettings.itemMultitouch && (eventDataLength > 0)) {
                    return;
                }

                if (!eventDatas[pointerId]) {
                    eventDatas[pointerId] = $.extend({}, eventStruct);
                }

                var eventData = eventDatas[pointerId];
                if (eventData.down) {
                    throw Error();
                }

                eventData.down = true;
                eventData.delta = 0;
                eventData.isOver = true;
                eventData.pointerId = pointerId;

                var target = event.currentTarget;
                target._eventData = eventData;
                var newEvent = createEvent(event, Touch.maTouchDown);
                target.dispatchEvent(newEvent);

                eventData.downPoint = window.generic.GetEventPoint(event);

                if (target._maTouchMoveEventTriggers > 0) {
                    eventData.HandleMove = HandleMove(target, eventData);
                    document.addEventListener(Touch.moveEvent, eventData.HandleMove);
                }

                eventData.HandleUp = HandleUp(target, eventData);
                document.addEventListener(Touch.endEvent, eventData.HandleUp);

                eventData.timer = setTimeout(Elapsed, _settings.deltaMs, pointerId, target);
            }

            subscribers[target] = HandleDown;

            var HandleUp = function (eventTarget, eventData) {
                var target = eventTarget;
                var data = eventData;

                return function (event){
                    if(event.button != 0){ // allow only left mouse button
                        return;
                    }

                    var pointerId = event.pointerId;

                    if (!data.down || (pointerId != data.pointerId)) {
                        return;
                    }

                    if (!data.delta) {
                        TimerStop(pointerId, true, false, target);
                    }

                    var newEvent = createEvent(event, Touch.maTouchUp);
                    target.dispatchEvent(newEvent);
                    Reset(pointerId, target);
                };
            };

            var HandleMove = function (eventTarget, eventData) {
                var target = eventTarget;
                var data = eventData;

                return function (event){
                    var pointerId = event.pointerId;

                    if (!data.down || (pointerId != data.pointerId)) {
                        return;
                    }

                    var $target = $(target);

                    var controlRect = {
                        top: $target.offset().top,
                        left: $target.offset().left,
                        width: target.offsetWidth,
                        height: target.offsetHeight
                    };
                    var currentPoint = window.generic.GetEventPoint(event);
                    var offset = { x: currentPoint.x - data.downPoint.x, y: currentPoint.y - data.downPoint.y };
                    var actuallyMoved = (Math.abs(offset.x) > _settings.moveDelta) || (Math.abs(offset.y) > _settings.moveDelta);

                    var leave = false;
                    if (window.generic.IsPointInRect(currentPoint, controlRect)) {
                        if (!data.isOver) {
                            target.dispatchEvent(createEvent(event, Touch.maTouchEnter));
                        }
                        data.isOver = true;
                    }
                    else if (data.isOver) {
                        data.isOver = false;
                        leave = true;
                    }

                    if (leave) {
                        target.dispatchEvent(createEvent(event, Touch.maTouchLeave));
                    } else {
                        target.dispatchEvent(createEvent(event, Touch.maTouchMove));
                    }

                    if (leave || actuallyMoved) {
                        TimerStop(pointerId, false);
                    }
                };
            };

            function Elapsed(pointerId, target){
                TimerStop(pointerId, true, true, target);
            }

            function TimerStop(pointerId, dropEventCycle, elapsed, target) {
                var eventData = eventDatas[pointerId];
                clearTimeout(eventData.timer);
                eventData.timer = 0;
                eventData.delta = 1;

                if (dropEventCycle) {
                    if (elapsed) {
                        if (eventData.down) {
                            var newEvent = createEvent(null, Touch.maLongTap);
                            target.dispatchEvent(newEvent);
                        }
                    }else{
                        if (eventData.down) {
                            var newEvent = createEvent(null, Touch.maTouchTap);
                            target.dispatchEvent(newEvent);
                        }else{
                            throw Error("Touch TimerStop. Impossible situation");
                        }
                    }
                }
            }

            function Reset(pointerId, target) {
                var eventData = eventDatas[pointerId];
                delete eventDatas[pointerId];

                eventData.down = 0;
                document.removeEventListener(Touch.endEvent, eventData.HandleUp);
                document.removeEventListener(Touch.moveEvent, eventData.HandleMove);
            }
        });
    };

    var off = function(target){
        if (subscribers[target]) {
            target.removeEventListener(Touch.startEvent, subscribers[target]);
            target._maTouchEventsSubscription = false;
            delete subscribers[target];
        }
    };

    var createEvent = function (sourceEvent, newType) {
        var newEvent = document.createEvent('CustomEvent');
        if (sourceEvent) {
            newEvent.initCustomEvent(newType, sourceEvent.bubbles, sourceEvent.cancelable, {});
            newEvent = $.extend(newEvent, sourceEvent);
        } else {
            newEvent.initCustomEvent(newType, true, true, {});
        }

        return newEvent;
    };



    // Intercept addEventListener calls by changing the prototype
    var interceptAddEventListener = function (root) {
        var current = root.prototype ? root.prototype.addEventListener : root.addEventListener;

        var customAddEventListener = function (name, func, capture) {
            if (supportedEventsNames.indexOf(name) != -1) {
                if (!this._maTouchEventsCount) {
                    this._maTouchEventsCount = 0;
                    on(this);
                }
                ++this._maTouchEventsCount;

                if (moveEventTriggers.indexOf(name) != -1) {
                    if (!this._maTouchMoveEventTriggers) {
                        this._maTouchMoveEventTriggers = 0;
                    }
                    ++this._maTouchMoveEventTriggers;
                }
            }

            if (current === undefined) {
                console.log("Can't subscribe '" + this + "' to event " + name);
            } else {
                current.call(this, name, func, capture);
            }
        };

        if (root.prototype) {
            root.prototype.addEventListener = customAddEventListener;
        } else {
            root.addEventListener = customAddEventListener;
        }
    };

    // Intercept removeEventListener calls by changing the prototype
    var interceptRemoveEventListener = function (root) {
        var current = root.prototype ? root.prototype.removeEventListener : root.removeEventListener;

        var customRemoveEventListener = function (name, func, capture) {
            if (supportedEventsNames.indexOf(name) != -1) {
                --this._maTouchEventsCount;
                if (this._maTouchEventsCount === 0) {
                    off(this);
                }
                this._maTouchEventsCount = Math.max(0, this._maTouchEventsCount);

                if (moveEventTriggers.indexOf(name) != -1) {
                    --this._maTouchMoveEventTriggers;
                    this._maTouchMoveEventTriggers = Math.max(0, this._maTouchMoveEventTriggers);
                }
            }

            if (current === undefined) {
                console.log("Can't unsubscribe '" + this + "' from event " + name);
            } else {
                current.call(this, name, func, capture);
            }
        };
        if (root.prototype) {
            root.prototype.removeEventListener = customRemoveEventListener;
        } else {
            root.removeEventListener = customRemoveEventListener;
        }
    };

    // Hooks
    interceptAddEventListener(window);
    interceptAddEventListener(window.HTMLElement || window.Element);
    interceptAddEventListener(document);
    interceptAddEventListener(HTMLBodyElement);
    interceptAddEventListener(HTMLDivElement);
    interceptAddEventListener(HTMLImageElement);
    interceptAddEventListener(HTMLUListElement);
    interceptAddEventListener(HTMLAnchorElement);
    interceptAddEventListener(HTMLLIElement);
    interceptAddEventListener(HTMLTableElement);
    if (window.HTMLSpanElement) {
        interceptAddEventListener(HTMLSpanElement);
    }
    if (window.HTMLCanvasElement) {
        interceptAddEventListener(HTMLCanvasElement);
    }
    if (window.SVGElement) {
        interceptAddEventListener(SVGElement);
    }

    interceptRemoveEventListener(window);
    interceptRemoveEventListener(window.HTMLElement || window.Element);
    interceptRemoveEventListener(document);
    interceptRemoveEventListener(HTMLBodyElement);
    interceptRemoveEventListener(HTMLDivElement);
    interceptRemoveEventListener(HTMLImageElement);
    interceptRemoveEventListener(HTMLUListElement);
    interceptRemoveEventListener(HTMLAnchorElement);
    interceptRemoveEventListener(HTMLLIElement);
    interceptRemoveEventListener(HTMLTableElement);
    if (window.HTMLSpanElement) {
        interceptRemoveEventListener(HTMLSpanElement);
    }
    if (window.HTMLCanvasElement) {
        interceptRemoveEventListener(HTMLCanvasElement);
    }
    if (window.SVGElement) {
        interceptRemoveEventListener(SVGElement);
    }

    ns.Touch = Touch;

})(jQuery, window);
