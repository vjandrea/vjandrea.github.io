defineNamespace(window, "uiTypes");

(function(ns) {
    var containerTemplate = _.template(
        '<div class="tablet-navigation-bar"> \
            <div class="bar-options-wrapper"> \
                <div class="bar-options"> \
                    <div data-rel="icon" class="bar-options-icon"> \
                        <img src="<%= icon %>"/> \
                        <div data-rel="index" class="bar-options-index"></div> \
                    </div> \
                    <div class="bar-options-content"> \
                        <div class="text content">Main Menu</div> \
                    </div> \
                    <embed data-rel="new-window-sign" class="newWindowSign" type="image/svg+xml" src="./images/newWindowSign.svg"> \
                </div> \
            </div> \
            <div class="bar-buttons-container line"> \
            </div> \
        </div>'
    );
    if(window.isDot2())
    {
        var itemTemplate = _.template(
            '<div class="bar-button-wrapper line-element"> \
                <div class="bar-button <%= active ? \"active\" : \"\" %>" data-id="<%= id %>"> \
                    <div class="bar-button-content"> \
                        <img src="<%= icon %>" class="navigationBarImg"> \
                        <div class="text content"><%= title %></div> \
                    </div> \
                </div> \
            </div>'
        );
    }
    else
    {
        var itemTemplate = _.template(
            '<div class="bar-button-wrapper line-element"> \
                <div class="bar-button <%= active ? \"active\" : \"\" %>" data-id="<%= id %>"> \
                    <div class="bar-button-content"> \
                        <div class="text content"><%= title %></div> \
                    </div> \
                </div> \
            </div>'
        );
    }


    var TabletNavigationBar = function($container) {
        this.data = null;
        this.$buttons = null;
        this.options = {
            containerClickHandler: null,
            icon: "",
            index: ""
        };

        this.$container = $(containerTemplate(this.options));
        this.$container.hide();
        $container.append(this.$container);

        this.$buttonsContainer = $(".bar-buttons-container", this.$container);
        this.$optionsButton = $(".bar-options-wrapper", this.$container);

        this.$icon = $("[data-rel=icon] img", this.$container);
        this.$index = $("[data-rel=index]", this.$container);
    };
    TabletNavigationBar.prototype.show = function () {
        this.$container.show();
    };
    TabletNavigationBar.prototype.hide = function () {
        this.$container.hide();
    };
    // {
    //     items: [
    //         {
    //             text,
    //             dataId,
    //             handler
    //         }
    //         ...
    //     ],
    //     options: {
    //         containerClickHandler: handler,
    //         icon: url,
    //         index: int
    //     }
    // }
    TabletNavigationBar.prototype.setData = function(data) {
        if (!data) {
            return;
        }

        if (!this.data || !this.data.items || (this.data.items && data.items && (this.data.items.length != data.items.length))) {
            create(this, data);
        } else {
            update(this, data);
        }
    };

    TabletNavigationBar.prototype.setTitle = function (title) {
        var $title = $(".active .text", this.$container);
        if (!(0 in $title)) {
            return;
        }

        $title.text(title);
    };

    function create(instance, data) {
        disposeItems(instance);

        if (data.items) {
            for (var i = 0; i < data.items.length; ++i) {
                var item = data.items[i];
                var itemHtml = itemTemplate(item);
                var $item = $(itemHtml);
                instance.$buttonsContainer.append($item);

                var $button = $(".bar-button", $item);
                instance.$buttons.push($button);
                $button.on(Touch.maTouchUp, item.handler);
            }
        }

        if (data.options) {
            updateContainerClickHandler(instance, data.options.containerClickHandler);
            updateIconAndIndex(instance, data.options.icon, data.options.index);
        }

        instance.data = data;
    };

    function update(instance, newData) {
        if (newData.items) {
            for (var i = 0; i < instance.data.items.length; ++i) {
                var oldItem = instance.data.items[i];
                var newItem = newData.items[i];

                var $button = instance.$buttons[i];

                if ((newItem.active !== undefined) && (oldItem.active !== newItem.active)) {
                    $button.toggleClass("active", newItem.active);
                    oldItem.active = newItem.active;
                }
            }
        }

        if (newData.options) {
            updateContainerClickHandler(instance, newData.options.containerClickHandler);
            updateIconAndIndex(instance, newData.options.icon, newData.options.index);
        }
    };

    function updateContainerClickHandler(instance, containerClickHandler) {
        if (containerClickHandler === undefined) {
            return;
        }

        if (containerClickHandler == instance.options.containerClickHandler) {
            return;
        }

        if (instance.options.containerClickHandler) {
            instance.$optionsButton.off(Touch.maTouchUp, false, instance.options.containerClickHandler);
        }
        if (containerClickHandler) {
            instance.$optionsButton.on(Touch.maTouchUp, containerClickHandler);
        }
        instance.options.containerClickHandler = containerClickHandler;
    }

    function updateIconAndIndex(instance, icon, index) {
        if ((icon !== undefined) && (icon != instance.options.icon)) {
            instance.$icon.attr("src", icon);
            instance.options.icon = icon;
        }

        if ((index !== undefined) && (index != instance.options.index)) {
            instance.$index.text(index);
            instance.options.index = index;
        }
    }

    function disposeItems(instance) {
        if (instance.$buttons && (instance.$buttons.length > 0)) {
            for (var i = 0; i < instance.$buttons.length; i++) {
                var $button = instance.$buttons[i];
                if ($button) {
                    $button.off(Touch.maTouchUp);
                }
            }
        }

        instance.$buttonsContainer.empty();

        instance.$buttons = [];
    };

    TabletNavigationBar.prototype.dispose = function() {
        if (this.options.containerClickHandler) {
            this.$optionsButton.off(Touch.maTouchUp, false, this.options.containerClickHandler);
        }
        disposeItems(this);
        this.$container.remove();
    };

    ns.TabletNavigationBar = TabletNavigationBar;
})(window.uiTypes);
