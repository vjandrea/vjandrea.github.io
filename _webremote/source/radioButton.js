window.uiTypes = window.uiTypes || {};
window.uiTypes.controls = window.uiTypes.controls || {};

(function(ns){

    // {
    //     text: string,
    //     handler: function,
    //     groupName: string,
    //     checked: bool
    // }
    var Control = function(){};

    var itemTemplate = _.template("<div data-type='radio-button' data-value='<%= value %>'><input type='radio' id='<%= id %>' name='<%= groupName %>' <%= checked ? \"checked\" : \"\" %> data-type='marker'/> \
        <label for='<%= id %>' data-type='label'><span class='content'><%= text %></span></label></div>");

    Control.create = function(data){
        data.id = "radio-" + data.text;
        var $item = $(itemTemplate(data));

        $item.on('change', data.handler);

        return $item;
    };

    Control.dispose = function($item) {
        $("[data-type=radio-button]", $item).off('change');
    };

    ns.RadioButton = {
        create: Control.create,
        dispose: Control.dispose
    };

})(window.uiTypes.controls);

(function(ns){

    // [
    //      {
    //          text: string,
    //          handler: function,
    //          checked: bool
    //      }
    // ]
    var Control = function(){};

    Control.create = function(items){
        var $container = $("<div data-type='radio-button-group'></div>");
        var name = "radio-name-" + Math.random();
        for (var i = 0; i < items.length; i++) {
            items[i].groupName = name;
            $container.append(ns.RadioButton.create(items[i]));
        }
        return $container;
    };

    Control.dispose = function($item) {
        var $group = $("[data-type=radio-button-group]", $item);
        for (var i = 0; i < $group.children.length; i++) {
            ns.RadioButton.dispose($group.children[i]);
        }
    };

    ns.RadioButtonGroup = {
        create: Control.create,
        dispose: Control.dispose
    };

})(window.uiTypes.controls);
