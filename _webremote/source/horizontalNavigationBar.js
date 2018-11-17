defineNamespace(window, "uiTypes");

(function(ns) {
    var containerTemplate = _.template('<div data-rel="buttons-container" class="horizontal-navigation-bar"></div>');
    var itemTemplate = _.template('<div data-rel="prev-button" class="horizontal-navigation-bar-left-button"> \
        <div data-rel="button-text" class="page-name"><%= prevTitle %></div> \
    </div> \
    <div data-rel="cur-button" class="horizontal-navigation-bar-current-page-title"> \
        <div data-rel="button-text"><%= curTitle %></div> \
        <div data-rel="icon" class="horizontal-navigation-bar-icon"> \
            <img src="<%= options.icon %>"/> \
            <div data-rel="index" class="horizontal-navigation-bar-index"><%= options.index %></div> \
        </div> \
        <embed data-rel="new-window-sign" class="newWindowSign" type="image/svg+xml" src="./images/newWindowSign.svg"> \
    </div> \
    <div data-rel="next-button" class="horizontal-navigation-bar-right-button"> \
        <div data-rel="button-text" class="page-name"><%= nextTitle %></div> \
    </div>');

    var HorizontalNavigationBar = function($container) {
        this.$container = $(containerTemplate());
        this.$container.hide();
        $container.append(this.$container);

        this.data = null;
        this.$items = null;
    };
    HorizontalNavigationBar.prototype.show = function () {
        this.$container.show();
    };
    HorizontalNavigationBar.prototype.hide = function () {
        this.$container.hide();
    };

    // data : {
    //     prevTitle: string,
    //     prevHandler: function,
    //     curTitle: string,
    //     curHandler: function,
    //     nextTitle: string,
    //     nextHandler: function,
    //     options: {
    //         icon: url,
    //         index: int
    //     }
    // }
    HorizontalNavigationBar.prototype.setData = function(data) {
        if (!data) {
            return;
        }

        if (!this.data) {
            this.create(data);
        } else {
            this.update(data);
        }
    };

    HorizontalNavigationBar.prototype.create = function(data) {
        this.disposeItems();

        this.data = {
            prevTitle: "",
            prevHandler: utilities.emptyFunction,
            curTitle: "",
            curHandler: utilities.emptyFunction,
            nextTitle: "",
            nextHandler: utilities.emptyFunction,
            options: {
                icon: "",
                index: ""
            }
        };

        this.$items = {};

        data.prevTitle = data.prevTitle || "";
        data.curTitle = data.curTitle || "";
        data.nextTitle = data.nextTitle || "";
        data.options = data.options || {};
        data.options.icon = data.options.icon || "";
        data.options.index = data.options.index || "";
        var itemsHtml = itemTemplate(data);
        var $items = $(itemsHtml);
        this.$container.append($items);

        this.$items.$prev = $("[data-rel=prev-button]", this.$container);
        this.$items.$cur = $("[data-rel=cur-button]", this.$container);
        this.$items.$next = $("[data-rel=next-button]", this.$container);
        this.$items.$icon = $("[data-rel=icon] img", this.$container);
        this.$items.$index = $("[data-rel=index]", this.$container);

        this.$items.$prev.on(Touch.maTouchUp, data.prevHandler);
        this.$items.$cur.on(Touch.maTouchUp, data.curHandler);
        this.$items.$next.on(Touch.maTouchUp, data.nextHandler);

        $.extend(this.data, data);
    };

    HorizontalNavigationBar.prototype.update = function(newData) {
        var oldData = this.data;

        if ((newData.prevHandler !== undefined) && (oldData.prevHandler !== newData.prevHandler)) {
            this.$items.$prev.off(Touch.maTouchUp, oldData.prevHandler);
            this.$items.$prev.on(Touch.maTouchUp, newData.prevHandler);
            oldData.prevHandler = newData.prevHandler;
        }
        if ((newData.curHandler !== undefined) && (oldData.curHandler !== newData.curHandler)) {
            this.$items.$cur.off(Touch.maTouchUp, oldData.curHandler);
            this.$items.$cur.on(Touch.maTouchUp, newData.curHandler);
            oldData.curHandler = newData.curHandler;
        }
        if ((newData.nextHandler !== undefined) && (oldData.nextHandler !== newData.nextHandler)) {
            this.$items.$next.off(Touch.maTouchUp, oldData.nextHandler);
            this.$items.$next.on(Touch.maTouchUp, newData.nextHandler);
            oldData.nextHandler = newData.nextHandler;
        }

        if ((newData.prevTitle !== undefined) && (oldData.prevTitle !== newData.prevTitle)) {
            $("[data-rel=button-text]", this.$items.$prev).text(newData.prevTitle);
            oldData.prevTitle = newData.prevTitle;
        }
        if ((newData.curTitle !== undefined) && (oldData.curTitle !== newData.curTitle)) {
            $("[data-rel=button-text]", this.$items.$cur).text(newData.curTitle);
            oldData.curTitle = newData.curTitle;
        }
        if ((newData.nextTitle !== undefined) && (oldData.nextTitle !== newData.nextTitle)) {
            $("[data-rel=button-text]", this.$items.$next).text(newData.nextTitle);
            oldData.nextTitle = newData.nextTitle;
        }

        if (newData.options) {
            if ((newData.options.icon !== undefined) && (oldData.options.icon !== newData.options.icon)) {
                this.$items.$icon.attr("src", newData.options.icon);
                oldData.options.icon = newData.options.icon;
            }

            if ((newData.options.index !== undefined) && (oldData.options.index !== newData.options.index)) {
                this.$items.$index.text(newData.options.index);
                oldData.options.index = newData.options.index;
            }
        }

        $.extend(this.data, newData);
    };

    HorizontalNavigationBar.prototype.disposeItems = function() {
        if (this.$items) {
            if (this.$items.$prev) {
                this.$items.$prev.off(Touch.maTouchUp, this.data.prevHandler);
            }

            if (this.$items.$cur) {
                this.$items.$cur.off(Touch.maTouchUp, this.data.curHandler);
            }

            if (this.$items.$next) {
                this.$items.$next.off(Touch.maTouchUp, this.data.nextHandler);
            }
        }

        this.$container.empty();
    };

    HorizontalNavigationBar.prototype.dispose = function() {
        this.disposeItems();
        this.$container.remove();
    };

    ns.HorizontalNavigationBar = HorizontalNavigationBar;
})(window.uiTypes);




(function(ns) {
    var containerTemplate = _.template('<div data-rel="buttons-container" class="modal-horizontal-navigation-bar"></div>');
    var itemTemplate = _.template('<div data-rel="cur-button" class="modal-horizontal-navigation-bar-current-page-title"> \
        <div data-rel="button-text"><%= curTitle %></div> \
    </div> \
    <div data-rel="next-button" class="modal-horizontal-navigation-bar-right-button"> \
        <div data-rel="button-text" class="page-name"><%= nextTitle %></div> \
    </div>');

    var ModalHorizontalNavigationBar = function($container) {
        this.$container = $(containerTemplate());
        this.$container.hide();
        $container.append(this.$container);

        this.data = null;
        this.$items = null;
    };
    ModalHorizontalNavigationBar.prototype.show = function () {
        this.$container.show();
    };
    ModalHorizontalNavigationBar.prototype.hide = function () {
        this.$container.hide();
    };

    // data : {
    //     curTitle: string,
    //     curHandler: function,
    //     nextTitle: string,
    //     nextHandler: function,
    // }
    ModalHorizontalNavigationBar.prototype.setData = function(data) {
        if (!this.data) {
            this.create(data);
        } else {
            this.update(data);
        }
    };

    ModalHorizontalNavigationBar.prototype.create = function(data) {
        if (!data) {
            return;
        }

        this.disposeItems();

        this.$items = {};

        data.curTitle = data.curTitle || "";
        data.nextTitle = data.nextTitle || "";
        var itemsHtml = itemTemplate(data);
        var $items = $(itemsHtml);
        this.$container.append($items);

        this.$items.$cur = $("[data-rel=cur-button]", this.$container);
        this.$items.$next = $("[data-rel=next-button]", this.$container);

        this.$items.$cur.on(Touch.maTouchUp, data.curHandler);
        this.$items.$next.on(Touch.maTouchUp, data.nextHandler);

        this.data = data;
    };

    ModalHorizontalNavigationBar.prototype.update = function(newData) {
        var oldData = this.data;

        if ((newData.curHandler !== undefined) && (oldData.curHandler !== newData.curHandler)) {
            this.$items.$cur.off(Touch.maTouchUp, oldData.curHandler);
            this.$items.$cur.on(Touch.maTouchUp, newData.curHandler);
            oldData.curHandler = newData.curHandler;
        }
        if ((newData.nextHandler !== undefined) && (oldData.nextHandler !== newData.nextHandler)) {
            this.$items.$next.off(Touch.maTouchUp, oldData.nextHandler);
            this.$items.$next.on(Touch.maTouchUp, newData.nextHandler);
            oldData.nextHandler = newData.nextHandler;
        }

        if ((newData.curTitle !== undefined) && (oldData.curTitle !== newData.curTitle)) {
            $("[data-rel=button-text]", this.$items.$cur).text(newData.curTitle);
            oldData.curTitle = newData.curTitle;
        }
        if ((newData.nextTitle !== undefined) && (oldData.nextTitle !== newData.nextTitle)) {
            $("[data-rel=button-text]", this.$items.$next).text(newData.nextTitle);
            oldData.nextTitle = newData.nextTitle;
        }

        this.data = newData;
    };

    ModalHorizontalNavigationBar.prototype.disposeItems = function() {
        if (this.$items) {

            if (this.$items.$cur) {
                this.$items.$cur.off(this.data.curHandler);
            }

            if (this.$items.$next) {
                this.$items.$next.off(this.data.nextHandler);
            }
        }

        this.$container.empty();
    };

    ModalHorizontalNavigationBar.prototype.dispose = function() {
        this.disposeItems();
        this.$container.remove();
    };

    ns.ModalHorizontalNavigationBar = ModalHorizontalNavigationBar;
})(window.uiTypes);
