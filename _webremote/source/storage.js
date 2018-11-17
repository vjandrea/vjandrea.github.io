(function (ns, $) {
    var sessionStorage = (typeof (window.Storage) !== "undefined") ? window.sessionStorage : false;
    if (sessionStorage) {
        try{
            sessionStorage.setItem('test', 1);
            sessionStorage.removeItem('test');
        } catch(error){
            sessionStorage = false;
        }
    }
    var localStorage = (typeof (window.Storage) !== "undefined") ? window.localStorage : false;
    if (localStorage) {
        try{
            localStorage.setItem('test', 1);
            localStorage.removeItem('test');
        } catch(error){
            localStorage = false;
        }
    }

    var Storage = function () {};

    var getActualStorage = function(saveGlobal){
        var actualStorage = null;
        if (localStorage && sessionStorage) {
            actualStorage = saveGlobal ? localStorage : sessionStorage;
        } else {
            actualStorage = localStorage || sessionStorage;
        }
        return actualStorage;
    }

    Storage.AddSection = function(name){
        if (Storage[name]) {
            window.generic.statusLogging("Storage section duplication '" + name + "'");
            return Storage[name];
        }

        var storage = Storage[name] = {
            Save: function (key, value, saveGlobal) {
                var fullKey = name + "." + key;
                var valueString = JSON.stringify(value) || "";
                var actualStorage = getActualStorage(saveGlobal);
                try{
                    if (actualStorage) {
                        actualStorage[fullKey] = valueString;
                    } else {
                        $.cookie(fullKey, valueString);
                    }
                } catch(error){
                    window.generic.statusLogging(error);
                }
            },
            Load: function (key, defaultValue) {
                var fullKey = name + "." + key;
                var value = null;
                try{
                    if (sessionStorage && sessionStorage[fullKey]) {
                        value = sessionStorage[fullKey];
                    } else if (localStorage && localStorage[fullKey]) {
                        value = localStorage[fullKey];
                    } else {
                        value = $.cookie(fullKey);
                    }

                    if (value) {
                        value = JSON.parse(value);
                    }
                    value = value || defaultValue;
                } catch(error){
                    window.generic.statusLogging(error);
                    value = defaultValue;
                }
                return value;
            }
        };

        storage.save = storage.Save;
        storage.load = storage.Load;
        return storage;
    };

    ns.Storage = Storage;
} (window, jQuery));
