defineNamespace(window, "uiTypes");

(function(ns) {
    var containerTemplate = _.template('<div class="vertical-bar preset-type-bar"></div>');
    var itemTemplate = _.template(
        '<div class="vertical-bar_item-wrapper preset-type-bar_item_wrapper"> \
            <div class="vertical-bar_item preset-type-bar_item <%= ( active ? \"vertical-bar_item__active preset-type-bar__active\" : \"\") %>" id="<%= id %>"> \
                <div class="preset-type-bar_item_number"><%= index %></div>\
                <div class="preset-type-bar_item_title" <%= ( active ? \"style=color:yellow\" : \"\") %>><%= title %></div>\
                <div class="preset-type-bar_item_indicator <%= (on ? \"on\" : \"\") %>"></div>\
            </div> \
        </div>'
    );
    var itemAllTemplate = _.template(
        '<div class="vertical-bar_item-wrapper preset-type-bar_item_wrapper"> \
            <div class="vertical-bar_item preset-type-bar_item <%= ( active ? \"vertical-bar_item__active preset-type-bar__active\" : \"\") %>" id="<%= id %>"> \
                <div class="preset-type-bar_item_number"><%= index %></div>\
                <div class="preset-type-bar_item_title" <%= ( active ? \"style=color:yellow\" : \"\") %>><%= title %></div>\
            </div> \
        </div>'
    );

    var PresetTypesBar = function(parent) {
        this.$container = $(containerTemplate());
        if (parent) {
            $(parent).append(this.$container);
        }
        this.template = itemTemplate;
        this.allTemplate = itemAllTemplate;

        this.modelItems = null;
        this.buttonClickHandler = presetTypeButtonPressedWithNumber.bind(this);
        this.itemSelectedCallback = Function.constructor;
    };

    var presetTypeButtonPressedWithNumber = function (e) {
        var number = e.data.number;
        log("selected preset type id: " + number);
        var n = this.modelItems.length;
        if (n > 0) {
            for (var i = 0; i < n; i++) {
                if (this.modelItems[i].index == number) {
                    this.itemSelectedCallback(number);
                    break;
                }
            }
        }
    };

    PresetTypesBar.prototype.getItem = function () {
        return this.$container;
    };

    PresetTypesBar.prototype.setupFull = function(){
        this.$container.toggleClass("hidden", true);
        disposeItems.call(this);
        if (this.modelItems.length <= 0) {
            return;
        }

        for (var i = 0; i < this.modelItems.length; i++) {
            var presetTypeButton = null;
            if(this.modelItems[i].index == 0)
            {
                if(window.allPresetSelected)
                {
                    this.modelItems[i].active = true;
                }
                presetTypeButton = this.allTemplate(this.modelItems[i]);
            }
            else
            {
                if(window.allPresetSelected && window.poolViewVisible)
                {
                    this.modelItems[i].active = false;
                }
                presetTypeButton = this.template(this.modelItems[i]);
            }
            var $presetTypeButton = $(presetTypeButton);

            this.modelItems[i].$item = $presetTypeButton;

            $presetTypeButton.on(Touch.maTouchUp, { number: this.modelItems[i].index }, this.buttonClickHandler);

            this.$container.append($presetTypeButton);
        }

        this.$container.toggleClass("hidden", false);
    };

    PresetTypesBar.prototype.setupUpdate = function (updates) {
        if (this.modelItems && updates) {
            assert(this.modelItems.length === updates.length, "PresetTypesUpdate invalid argument. Incoming array length differs from existing one");

            for (var i = 0; i < this.modelItems.length; i++) {
                var oldItem = this.modelItems[i];
                var newItem = updates[i];

                var activePresetChanged = (newItem.active !== undefined) && (oldItem.active !== newItem.active);
                var indicatorChanged = (newItem.on !== undefined) && (oldItem.on !== newItem.on);
                var titleChanged = (newItem.title !== undefined) && (oldItem.title !== newItem.title);

                if (activePresetChanged || indicatorChanged || titleChanged) {
                    var $presetElement = $(".preset-type-bar_item", oldItem.$item);

                    if (activePresetChanged) {
                        $presetElement.toggleClass("vertical-bar_item__active", newItem.active);
                        oldItem.active = newItem.active;
                    }

                    if (indicatorChanged) {
                        var indicator = $(".preset-type-bar_item_indicator", $presetElement);
                        indicator.toggleClass("on", newItem.on);
                        oldItem.on = newItem.on;
                    }

                    if (titleChanged) {
                        var title = $(".preset-type-bar_item_title", $presetElement);
                        title.text(newItem.title);
                        oldItem.title = newItem.title;
                    }
                }
            }
        }
    };

    PresetTypesBar.prototype.render = function (data) {
        if (!data.presets) {
            return false;
        }
        var newPresetTypeArray = [];

        if(window.poolViewVisible) //Pool view
        {
            newPresetTypeArray.push({
                id: "presetType0",
                active: false,
                index: 0,
                title: "All",
                on: 0
            });
        }

        _.each(data.presets, function(element, index, list){
            newPresetTypeArray.push({
                id: "presetType" + (element.i || undefined),
                active: element.s,
                index: element.i || undefined,
                title: element.np,
                on: element.a
            });
        }, this);

        if (data.init || !this.modelItems || (this.modelItems.length != newPresetTypeArray.length)) {
            this.modelItems = newPresetTypeArray;
            this.setupFull();
        } else {
            this.setupUpdate(newPresetTypeArray);
        }
        return true;
    };

    function disposeItems() {
        if (this.modelItems && (this.modelItems.length > 0)) {
            for (var i = 0; i < this.modelItems.length; i++) {
                var $item = this.modelItems[i].$item;
                if ($item) {
                    $item.off(Touch.maTouchUp, this.buttonClickHandler);
                }
            }
        }

        this.$container.empty();
    };

    PresetTypesBar.prototype.dispose = function() {
        disposeItems.call(this);
        this.$container.remove();
    };

    ns.PresetTypesBar = PresetTypesBar;
})(window.uiTypes);

(function (ns) {
    var requestTypes = window.Server.requestTypes;

    var PresetTypesDataControl = function(commandLine, commandExecutor, presetTypesUIControl){
        this.m_commandLine = commandLine;
        this.commandExecutor = commandExecutor;
        this.presetTypesUIControl = presetTypesUIControl;
        this.presetTypesUIControl.itemSelectedCallback = this.onItemSelected.bind(this);
        this.$tempParent = null;

        this.full_preset_type_init = true;
        this.isActive = false;
        this.model = null;

        this.dataHandlerName = "PresetDataHandler";
        this.refresh_context = this.refresh.bind(this);
        this.dataRequest_context = this.dataRequest.bind(this);
        this.dataHandler_context = this.dataHandler.bind(this);
    };

    PresetTypesDataControl.prototype.onItemSelected = function (number) {
        var cmdlineText = this.m_commandLine.getText()+" PT " + number;

        for(var i = 0; i < 10; i++)
        {
            var currPresetItem = document.getElementById("presetType"+i);
            if(currPresetItem)
            {
                if(i == number)
                {
                    currPresetItem.children[1].style.color = "yellow";
                }
                else
                {
                    currPresetItem.children[1].style.color = "";
                }
            }
        }

        if(number == 0)
        {
            window.allPresetSelected = true;
        }
        else
        {
            window.allPresetSelected = false;
        }

        this.commandExecutor.send({
            command: cmdlineText
        });
    };

    PresetTypesDataControl.prototype.dataRequest = function () {
        this.commandExecutor.send({
            requestType: requestTypes.presetTypeList
        });
    };

    PresetTypesDataControl.prototype.dataHandler = function(data) {
        if (data.responseType != requestTypes.presetTypeList) {
            return false;
        }

        this.model = {
            init: this.full_preset_type_init,
            presets: data.pre
        };

        this.full_preset_type_init = false;
        return true;
    };

    PresetTypesDataControl.prototype.refresh = function () {
        if (this.model) {
            this.presetTypesUIControl.render(this.model);
        }
    };

    PresetTypesDataControl.prototype.dispose = function() {
        this.deactivate();

        if (this.presetTypesUIControl) {
            this.presetTypesUIControl.dispose();
            this.presetTypesUIControl = null;
        }
    };




    var GlobalTimers = window.timers.GlobalTimers;
    var DataHandlerManager = window.DataHandlerManager;
    PresetTypesDataControl.prototype.activate = function () {
        if (this.isActive) {
            return;
        }

        GlobalTimers.AddRequestTimerEventHandler(this.dataRequest_context);
        GlobalTimers.AddRefreshTimerEventHandler(this.refresh_context);
        DataHandlerManager.Register({
            name: this.dataHandlerName,
            handler: this.dataHandler_context
        });

        this.isActive = true;
        if (this.$tempParent) {
            this.$oldParent.append(this.presetTypesUIControl.getItem());
        }
    };

    PresetTypesDataControl.prototype.deactivate = function () {
        if (!this.isActive) {
            return;
        }

        GlobalTimers.RemoveRequestTimerEventHandler(this.dataRequest_context);
        GlobalTimers.RemoveRefreshTimerEventHandler(this.refresh_context);
        DataHandlerManager.Unregister(this.dataHandlerName);

        this.isActive = false;
        if (!this.$tempParent) {
            this.$tempParent = $("<div></div>");
        }

        this.$oldParent = this.presetTypesUIControl.getItem().parent();
        this.$tempParent.append(this.presetTypesUIControl.getItem());
    };

    ns.PresetTypesDataControl = PresetTypesDataControl;
})(window.uiTypes);
