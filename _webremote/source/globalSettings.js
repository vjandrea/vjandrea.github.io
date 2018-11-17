defineNamespace(window, "generic.globs");

(function (ns) {
    ns.config = {
        layout: {
            phone: {
                id: "phone",
                title: "Phone",
                dataPageLayout: "phone-layout",
                genericPage: {
                    presetTypeBar: false
                },
                pools: {
                    minEmptyItems: 10
                },
                executorSheet: {
                    fixedColumnsCount: 1
                },
            },
            tablet: {
                id: "tablet",
                title: "Tablet",
                dataPageLayout: "tablet-layout",
                genericPage: {
                    presetTypeBar: true
                },
                pools: {
                    minEmptyItems: 0
                },
                executorSheet: {
                    fixedColumnsCount: 2
                }
            }
        },
        icons: {
            world: "./images/MAIMG_ELEMENT_WORLD.png"
        }
    };
    ns.config.layout.default = ns.config.layout.phone;
    ns.config.keyboardCaptured = false;
})(window.generic.globs);

(function (ns) {
    function defineObservableProperty(owner, name, descriptor){
        Object.defineProperty(owner, name, {
            get: descriptor.get,
            set: function(value){
                var oldValue = descriptor.get();
                if (oldValue !== value) {
                    descriptor.set(value);
                    $(owner).triggerHandler("propertyChanged", {name: name, oldValue: oldValue, newValue: value});
                }
            }
        });
    }

    var globalSettings = function(storage) {
        var m_storage = storage;
        var properties = [
            { name: "layout", defaultValue: generic.globs.config.layout.default.id }
        ];

        properties.forEach( ((function(item, index, array){
            defineObservableProperty(this, item.name, {
                get: function(){
                    return m_storage.Load(item.name);
                },
                set: function(value){
                    m_storage.Save(item.name, value, true);
                }
            });

            if (this[item.name] === undefined) {
                this[item.name] = item.defaultValue;
            }
        }).bind(this)) );
    };

    ns.GlobalSettings = new globalSettings(Storage.AddSection("globalSettings"));
})(window.generic.globs);
