(function(namespace){

    var Page = function(commandLine, commandExecutor, globalSettings) {
        Page.superclass.constructor.call(this, commandLine, commandExecutor, globalSettings);
        this.requirements = {};
    };
    window.generic.extend(Page, window.uiTypes.pages.Page);
    Page.id = "settings";
    Page.title = "Settings";
    Page.content = '<div id="' + Page.id + '">' + '</div>';

    Page.sectionTemplate = _.template('<div class="settings-section">\
        <div class="section-title"><span class="content"><%= title%></span></div>\
        <div class="section-content section-content-js"></div>\
    </div>');

    Page.footerTemplate = _.template('<div class="settings_copyright-footer">Copyright &copy 1994-' + (new Date().getFullYear()) + ' MA Lighting Technology GmbH All rights reserved.<br/>MA Lighting Technology GmbH Dachdeckerstra&szlige 16 97297 Waldb&uumlttelbrunn</div>');

    Page.prototype.Init = function () {
        Page.superclass.Init.call(this);

        // Layout section

        var $layoutSection = $(Page.sectionTemplate({ title: "Select layout" }));
        var $layoutSectionContent = $(".section-content-js", $layoutSection);

        var layoutChanged = (function(event){
            this.m_globalSettings.layout = $(event.currentTarget).attr("data-value");
            generic.globs.config.activeLayout = $(event.currentTarget).attr("data-value");
        }).bind(this);

        var layoutItems = _.filter(_.map(generic.globs.config.layout, function(item, key){
            if (key === "default") {
                return false;
            }
            return { value: item.id, text: item.title };
        }), Boolean);

        for (var i = 0; i < layoutItems.length; i++) {
            layoutItems[i].handler = layoutChanged;
            layoutItems[i].checked = this.m_globalSettings.layout === layoutItems[i].value;
        }

        this.$radioButtonGroup = window.uiTypes.controls.RadioButtonGroup.create(layoutItems).addClass("radioButtons line");
        $layoutSectionContent.append(this.$radioButtonGroup);

        var $copyrightFooter = $(Page.footerTemplate());

        this.$page.append($layoutSection);
        this.$page.append($copyrightFooter);
    };

    Page.prototype.Close = function () {
        window.uiTypes.controls.RadioButtonGroup.dispose();

        Page.superclass.Close.call(this);
    };

    namespace.Settings = Page;

})(window.uiTypes.pages);
