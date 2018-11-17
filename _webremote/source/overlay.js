(function ($) {

    var config = generic.globs.config;

    var m_overlay = $.getOrCreate("popupOverlay");
    $.Popup = function () {}
    $.Popup.settings = [];
//     data
//     {
//         control: control,
//         overlay: overlay,
//         modalWindow: modalWindow,
//         title: title,
//         textboxes: [
//             {
//                 id: id,
//                 text: text,
//                 type: type, // text [default], password
//                 value: value,
//                 focused: focused,
//             },...
//         ],
//         messages: [
//             {
//                 text: text
//             },...
//         ],
//         buttons : [
//             {
//                 id:id,
//                 type: type,      // default, custom
//                 click:clickHandler,
//                 text: text,
//                 focused: focused
//             },...
//         ],
//         options : [
//             {
//                 title:string,
//                 options: [
//                    optionText,...
//                  ]
//             },...
//         ],
//         dropDowns: [
//             {
//                 label: text,
//                 items: [{ id: id, text: text, selected: bool }, ... ]
//             },...
//         ],
//         formSubmitHandler: formSubmitHandler,
//         stylePrefix: stylePrefix,
//         onClose: function
//     }

    $.Popup.Show = function(data) {
        if (!data.control) {
            if (!data.overlay) {
                throw new Error();
            }
            GeneratePopup(data);
        } else if (GetPopupSettingsIndex(data) > -1) {
            return;
        }

        var overlay = data.overlay || m_overlay;

        var elementZIndex = data.control.css('z-index');
        var overlayZIndex = overlay.css('z-index');
        if (!parseInt(overlayZIndex)) {
            //throw new Error();
            overlayZIndex = 4;
        }

        data.control.css('z-index', parseInt(overlay.css('z-index')) + 1);
        var newPopupSettings = {
            control:data.control,
            overlay: overlay,
            z_index: elementZIndex,
            startEventHandlers: null,
            onClose: data.onClose
        };

        var events = $.events(overlay) ? $.events(overlay)[0].events[Touch.startEvent] : null;
        if (events) {
            newPopupSettings.startEventHandlers = [];
            for (var i = 0; i < events.length; i++) {
                newPopupSettings.startEventHandlers.push(events[i].handler);
            }
        }
        $.Popup.settings.push(newPopupSettings);

        overlay.unbind(Touch.startEvent);
        if (!data.modalWindow) {
            overlay.bind(Touch.startEvent, $.Popup.CloseLast);
        }
        data.control.show();
        overlay.show();

        var $focusedItem = $("[data-focus=true]", data.control);
        if (0 in $focusedItem) {
            setTimeout(function(){
                $focusedItem.focus();
            }, 100);
        }

        document.addEventListener("keyup", newPopupSettings.onKeyUp);

        config.keyboardCaptured = false;
    }

    var focusFunction = "'this.setSelectionRange(0, this.value.length)'";

    var textboxTemplate = _.template(
        '<label class="<%= data.stylePrefix %>" rel="label" for="<%= textbox.id %>">\
            <%= textbox.text %>\
        </label> \
        <input class="<%= data.stylePrefix %>" rel="<%= textbox.type || "text" %>" type="<%= textbox.type || "text" %>" id="<%= textbox.id %>"\
            value="<%= textbox.value %>" tabindex="<%= tabStopIndex %>" data-focus="<%= (textbox.focused ? "true" : "false") %>" <%= (textbox.autoSelect ? "onfocus='+focusFunction+'" : "") %> <%= (textbox.autoCapitalize ? "autocomplete=\\"off\\" autocorrect=\\"off\\" autocapitalize=\\"off\\" spellcheck=\\"false\\"" : "") %> />'
    );

    var optionGroupTemplate = _.template(
        '<li class="<%= data.stylePrefix %>" rel="optionGroupWrapper">\
            <div class="<%= data.stylePrefix %> button" rel="optionGroupTitle" id="optionGroupTitle<%= index %>" >\
                <%= title %>\
            </div>\
            <%= content %>\
        </li>'
    );

    if(isDot2())
    {
        var optionRadioTemplate = _.template(
            '<li class="optionWrapper" rel="optionWrapper" id="<%= groupIndex %>_option<%= index %>_wrapper" name="<%= name %>" >\
                <input type="radio" class="<%= data.stylePrefix %> commandoption" rel="option" id="<%= groupIndex %>_option<%= index %>" name="<%= groupIndex %>" />\
                <label class="<%= data.stylePrefix %> commandoptionLabel" rel="optionLabel" id="<%= groupIndex %>_option<%= index %>Label" for="<%= data.stylePrefix %>_option<%= index %>"><%= text %></label>\
            </li>'
        );

        var optionRadioTemplateChecked = _.template(
            '<li class="optionWrapper active" rel="optionWrapper" id="<%= groupIndex %>_option<%= index %>_wrapper" name="<%= name %>" >\
                <input type="radio" class="<%= data.stylePrefix %> commandoption" rel="option" id="<%= groupIndex %>_option<%= index %>" name="<%= groupIndex %>" checked />\
                <label class="<%= data.stylePrefix %> commandoptionLabel" rel="optionLabel" id="<%= groupIndex %>_option<%= index %>Label" for="<%= data.stylePrefix %>_option<%= index %>"><%= text %></label>\
            </li>'
        );

        var optionCheckboxTemplate = _.template(
            '<li class="optionWrapper" rel="optionWrapperChk" id="<%= groupIndex %>_wrapper" name="<%= name %>" >\
                <input type="checkbox" class="<%= data.stylePrefix %> commandoption" rel="option" id="<%= groupIndex %>_ckb" name="<%= groupIndex %>" />\
                <div class="<%= data.stylePrefix %> commandoptionImg" rel="optionImg" id="<%= groupIndex %>Img" ></div>\
            </li>'
        );

        var optionCheckboxTemplateChecked = _.template(
            '<li class="optionWrapper active noBorder" rel="optionWrapperChk" id="<%= groupIndex %>_wrapper" name="<%= name %>" >\
                <input type="checkbox" class="<%= data.stylePrefix %> commandoption" rel="option" id="<%= groupIndex %>_ckb" name="<%= groupIndex %>" checked />\
                <div class="<%= data.stylePrefix %> commandoptionImg" rel="optionImg" id="<%= groupIndex %>Img" ></div>\
            </li>'
        );
    }
    else
    {
        var optionRadioTemplate = _.template(
            '<li class="optionWrapper" rel="optionWrapper" id="<%= groupIndex %>_option<%= index %>_wrapper" name="<%= name %>" >\
                <input type="radio" class="<%= data.stylePrefix %> commandoption" rel="option" id="<%= groupIndex %>_option<%= index %>" name="<%= groupIndex %>" />\
                <div class="<%= data.stylePrefix %> commandoptionImg" rel="optionImg" ></div>\
                <label class="<%= data.stylePrefix %> commandoptionLabel" rel="optionLabel" id="<%= groupIndex %>_option<%= index %>Label" for="<%= data.stylePrefix %>_option<%= index %>"><%= text %></label>\
            </li>'
        );

        var optionRadioTemplateChecked = _.template(
            '<li class="optionWrapper active noBorder" rel="optionWrapper" id="<%= groupIndex %>_option<%= index %>_wrapper" name="<%= name %>" >\
                <input type="radio" class="<%= data.stylePrefix %> commandoption" rel="option" id="<%= groupIndex %>_option<%= index %>" name="<%= groupIndex %>" checked />\
                <div class="<%= data.stylePrefix %> commandoptionImg" rel="optionImg" ></div>\
                <label class="<%= data.stylePrefix %> commandoptionLabel" rel="optionLabel" id="<%= groupIndex %>_option<%= index %>Label" for="<%= data.stylePrefix %>_option<%= index %>"><%= text %></label>\
            </li>'
        );

        var optionCheckboxTemplate = _.template(
            '<li class="optionWrapper" rel="optionWrapperChk" id="<%= groupIndex %>_wrapper" name="<%= name %>" >\
                <input type="checkbox" class="<%= data.stylePrefix %> commandoption" rel="option" id="<%= groupIndex %>_ckb" name="<%= groupIndex %>" />\
                <div class="<%= data.stylePrefix %> commandoptionImg" rel="optionImg" id="<%= groupIndex %>Img" ></div>\
                <label class="<%= data.stylePrefix %> commandoptionLabel" rel="optionLabel" id="<%= groupIndex %>_optionLabel" for="<%= groupIndex %>Img"><%= text %></label>\
            </li>'
        );

        var optionCheckboxTemplateChecked = _.template(
            '<li class="optionWrapper active noBorder" rel="optionWrapperChk" id="<%= groupIndex %>_wrapper" name="<%= name %>" >\
                <input type="checkbox" class="<%= data.stylePrefix %> commandoption" rel="option" id="<%= groupIndex %>_ckb" name="<%= groupIndex %>" checked />\
                <div class="<%= data.stylePrefix %> commandoptionImg" rel="optionImg" id="<%= groupIndex %>Img" ></div>\
                <label class="<%= data.stylePrefix %> commandoptionLabel" rel="optionLabel" id="<%= groupIndex %>_optionLabel" for="<%= groupIndex %>Img"><%= text %></label>\
            </li>'
        );
    }

    var buttonTemplate = _.template(
        '<li class="<%= data.stylePrefix %>" rel="buttonWrapper">\
            <button class="<%= data.stylePrefix %> commandbutton" rel="button" data-role="submit" tabindex="<%= tabStopIndex %>" id="<%= button.id %>"  data-focus="<%= (button.focused ? "true" : "false") %>" name="<%= button.btnId %>" >\
                <%= button.text %>\
            </button>\
        </li>'
    );
    function GeneratePopup(data) {
        data.onClose = data.onClose || function () { };

        var tabStopIndex = 100;
        var createLogic = false;

        data.overlay.attr("rel", "overlay");
        data.overlay.attr("class", data.stylePrefix);
        var content = '<div class="' + data.stylePrefix + '" rel="container">';
        if (data.title) {
            content += '<div class="' + data.stylePrefix + '" rel="title-bar"><div class="' + data.stylePrefix + '" rel="title">' + data.title + '</div><div class="' + data.stylePrefix + '" rel="close-button"></div></div>';
        }
        content += '<div class="' + data.stylePrefix + '" rel="content">';

        if (data.messages) {
            for (var i = 0; i < data.messages.length; i++) {
                content += '<p class="' + data.stylePrefix + '" rel="message">' + $.consoleStringToHTML(data.messages[i].text) + '</p>';
            }
        }

        if ((data.textboxes && (data.textboxes.length > 0)) || (data.buttons && (data.buttons.length > 0)) || (data.dropDowns && (data.dropDowns.length > 0))) {
            content+='<form class="' + data.stylePrefix + '" rel="form">';

            if (data.dropDown) {
                content += '<div class="' + data.stylePrefix + '" rel="dropDownContainer"></div>';
            }

            if (data.textboxes) {
                for (var i = 0; i < data.textboxes.length; i++) {
                    content+= textboxTemplate({
                        data: data,
                        textbox: data.textboxes[i],
                        tabStopIndex: tabStopIndex
                    });
                    ++tabStopIndex;
                }
            }

            if (data.options) {
                content += '<ul class="' + data.stylePrefix + '" rel="options">';
                for (var i = 0; i < data.options.length; i++) {
                    var groupContent = '<ul id="optionsContainer'+i+'" class="alert" rel="optionsContainer">';
                    createLogic = true;
                    if(data.options[i].type == 0) //radio
                    {
                        for(var j = 0; j < data.options[i].options.length; j++)
                        {
                            if(j == data.options[i].activeOption)
                            {
                                groupContent += optionRadioTemplateChecked({
                                    text: data.options[i].options[j].text,
                                    data: data,
                                    index: j,
                                    groupIndex: "group"+i,
                                    name: data.options[i].options[j].id
                                });
                            }
                            else
                            {
                                groupContent += optionRadioTemplate({
                                    text: data.options[i].options[j].text,
                                    data: data,
                                    index: j,
                                    groupIndex: "group"+i,
                                    name: data.options[i].options[j].id
                                });
                            }
                        }
                    }
                    else //Checkbox
                    {
                        if(isDot2())
                        {
                            if(data.options[i].activeOption == 1)
                            {
                                groupContent += optionCheckboxTemplateChecked({
                                    data: data,
                                    groupIndex: "group"+i,
                                    name: data.options[i].id
                                });
                            }
                            else
                            {
                                groupContent += optionCheckboxTemplate({
                                    data: data,
                                    groupIndex: "group"+i,
                                    name: data.options[i].id
                                });
                            }
                        }
                        else
                        {
                            if(data.options[i].activeOption == 1)
                            {
                                groupContent += optionCheckboxTemplateChecked({
                                    data: data,
                                    groupIndex: "group"+i,
                                    name: data.options[i].id,
                                    text: data.options[i].title
                                });
                            }
                            else
                            {
                                groupContent += optionCheckboxTemplate({
                                    data: data,
                                    groupIndex: "group"+i,
                                    name: data.options[i].id,
                                    text: data.options[i].title
                                });
                            }
                        }
                    }

                    if(groupContent != "")
                    {
                        groupContent += '</ul>';
                        if(data.options[i].title)
                        {
                            content += optionGroupTemplate({
                                title: data.options[i].title,
                                data: data,
                                content: groupContent,
                                index: i
                            });
                        }
                        else
                        {
                            content += groupContent;
                        }
                        ++tabStopIndex;
                    }
                }
                content += '</ul>';
            }

            if (data.buttons) {
                content += '<ul class="' + data.stylePrefix + '" rel="buttons">';
                for (var i = 0; i < data.buttons.length; i++) {
                    data.buttons[i].text = $.consoleStringToHTML(data.buttons[i].text);
                    content += buttonTemplate({
                        data: data,
                        button: data.buttons[i],
                        tabStopIndex: tabStopIndex,
                    });
                    ++tabStopIndex;
                }
                content += '</ul>';
            }

            content+='</form>';
        }

        content += '</div></div>';

        data.overlay.html(content);

        if(createLogic) //UI Logic
        {
            for (var i = 0; i < data.options.length; i++)
            {
                if(data.options[i].type == 0) //radio
                {
                    for(var j = 0; j < data.options[i].options.length; j++)
                    {
                        var currRadioButtonWrapper = document.getElementById("group"+i+"_option"+j+"_wrapper");
                        if(currRadioButtonWrapper)
                        {
                            currRadioButtonWrapper.onclick = function(event)
                            {
                                var elem = event.currentTarget;
                                if(elem)
                                {
                                    var id = elem.id.substr(0,elem.id.length-8);
                                    var group = elem.id.substring(5,elem.id.search("_o"));
                                    var linkedRadioButton = document.getElementById(id);
                                    if(linkedRadioButton)
                                    {
                                        linkedRadioButton.click();
                                        var i = 0;
                                        while(true)
                                        {
                                            var currWrapper = document.getElementById("group"+group+"_option"+i+"_wrapper");
                                            var currBtn = document.getElementById("group"+group+"_option"+i);
                                            if(currWrapper && currBtn)
                                            {
                                                if(!currBtn.checked)
                                                {
                                                    currWrapper.className = "optionWrapper";
                                                }
                                                i++;
                                            }
                                            else
                                            {
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        var currRadioButton = document.getElementById("group"+i+"_option"+j);
                        if(currRadioButton)
                        {
                            currRadioButton.onchange = function(event)
                            {
                                var elem = event.currentTarget;
                                if(elem)
                                {
                                    var linkedRadioButtonWrapper = document.getElementById(elem.id+"_wrapper");
                                    if(linkedRadioButtonWrapper)
                                    {
                                        if(elem.checked && elem.checked == true)
                                        {
                                            linkedRadioButtonWrapper.className = "optionWrapper active";
                                        }
                                        else
                                        {
                                            linkedRadioButtonWrapper.className = "optionWrapper";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    var currCheckboxButtonWrapper = document.getElementById("group"+i+"_wrapper");
                    if(currCheckboxButtonWrapper)
                    {
                        currCheckboxButtonWrapper.onclick = function(event)
                        {
                            var elem = event.currentTarget;
                            if(elem)
                            {
                                var id = elem.id.substr(0,elem.id.length-8)+"_ckb";
                                var linkedCheckbox = document.getElementById(id);
                                if(linkedCheckbox)
                                {
                                    linkedCheckbox.click();
                                }
                            }
                        }
                    }
                    var currCheckbox = document.getElementById("group"+i+"_ckb");
                    if(currCheckbox)
                    {
                        currCheckbox.onchange = function(event)
                        {
                            var elem = event.currentTarget;
                            if(elem)
                            {
                                var linkedRadioButtonWrapper = document.getElementById(elem.id.substr(0,elem.id.length-4)+"_wrapper");
                                if(linkedRadioButtonWrapper)
                                {
                                    if(elem.checked && elem.checked == true)
                                    {
                                        linkedRadioButtonWrapper.className = "optionWrapper active noBorder";
                                    }
                                    else
                                    {
                                        linkedRadioButtonWrapper.className = "optionWrapper";
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (data.formSubmitHandler) {
            $("[rel='form']", data.overlay).bind('submit', function (event) {
                var values = 0;
                if (data.textboxes) {
                    var allTextBoxes = $("[rel='text'], [rel='password']", data.overlay);
                    values = {};
                    for (var i = 0; i < allTextBoxes.length; i++) {
                        var cur = $(allTextBoxes[i]);
                        values[cur.attr("id")] = cur.val();
                    }
                }
                return data.formSubmitHandler(event, values);
            });
        } else {
            $("[rel='form']", data.overlay).bind('submit', function() {
                $.Popup.CloseLast();
                return false;
            });
        }

        if (data.dropDown) {
            var $dropDownContainer = $("[rel='dropDownContainer']", data.overlay);
            var dropDown = data.dropDown;

            var states = [];
            for (var j = 0; j < dropDown.items.length; ++j){
                states.push({ value: dropDown.items[j].id, text: $.consoleStringToHTML(dropDown.items[j].text), default: dropDown.items[j].selected });
            }

            var newCommandType = commands.createCommandType(
                $.extend({}, {
                    id: "someDropDownCommand" + i,
                    title: dropDown.label,
                }, { states: states })
            );
            commands.addCommandType(newCommandType);

            var uiCommand = {
                command: commands.StateCommand(newCommandType, function (command, eventType, value) {
                    commands.ui.defaultCommandExecute(command, eventType, value);

                    data.dropDown.onItemChanged(command.getState().value);
                }),
                uiElement: commands.ui.UIDropDown()
            };
            uiCommand.uiElement.init(uiCommand.command);

            var $label = $('<span class="' + data.stylePrefix + '" rel="dropDownLabel">' + dropDown.label + '</span>');
            var $dropDown = $('<div class="' + data.stylePrefix + '" rel="dropDown"></div>');
            $dropDown.append(uiCommand.uiElement.getItem());
            $dropDownContainer.append($label);
            $dropDownContainer.append($dropDown);
            generic.globs.serverCommandManager.addCommands("dropDownCommands", [uiCommand]);

            var oldOnClose = data.onClose;
            data.onClose = (function () {
                commands.ui.disposeUIElements([uiCommand]);
                oldOnClose();
            }).bind(this);
        }

        var displayOptions = false;

        if (data.buttons) {
            var buttonWidth = 100 / data.buttons.length;
            $("[rel='buttonWrapper']").css({width: buttonWidth + "%"});

            for (var i = 1; i <= data.buttons.length; i++) {
                var button = $("[rel='button']:nth-child(" + i + ")", data.overlay);
                if (data.buttons[i - 1].click) {
                    button.bind(Touch.endEvent, data.buttons[i - 1].click);
                }
            }
        }

        if (data.options && data.options.length > 0) {
            displayOptions = true;
            var optionWidth = 100 / data.options.length
            $("[rel='optionGroupWrapper']").css({width: optionWidth+"%"});

            if(isDot2())
            {
                //apply proportions
                var buttonContainerWidth = (data.buttons.length / (data.buttons.length + data.options.length))*100;
                var optionContainerWidth = (data.options.length / (data.buttons.length + data.options.length))*100;
                $("[rel='options']").css({width: optionContainerWidth+"%"});
                $("[rel='buttons']").css({width: buttonContainerWidth+"%"});
            }
        }

        data.control = $(":first", data.overlay);

        $("[rel='close-button']", data.overlay).on(Touch.maTouchUp, $.Popup.Close.bind(this, data.control));
    }

    $.Popup.Close = function(control) {
        var index = getIndex(control);
        if (index < 0) { return }
        var isTopPopup = (index == $.Popup.settings.length - 1);
        var lastPopup = (index == 0);

        var popup = $.Popup.settings[index];

        if (popup.onClose) {
            popup.onClose();
        };

        $.Popup.settings.splice(index, 1);
        var existOtherPopup = false;
        for (var i = 0; i < $.Popup.settings.length; i++) {
            if ( ($.Popup.settings != popup) && ($.Popup.settings.overlay == popup.overlay)) {
                existOtherPopup = true;
                break;
            }
        }
        if (!existOtherPopup) {
            popup.overlay.hide();
        }
        popup.control.hide();

        if (isTopPopup) {
            popup.overlay.unbind(Touch.startEvent, $.Popup.CloseLast);
            if (popup.startEventHandlers) {
                for (var i = 0; i < popup.startEventHandlers.length; i++) {
                    popup.overlay.bind(Touch.startEvent, popup.startEventHandlers[i]);
                }
            }
        }

        popup.control.css('z-index', popup.z_index);

        config.keyboardCaptured = lastPopup;

        document.removeEventListener("keyup", popup.onKeyUp);
    }

    function getIndex (control) {
        for (var i = 0; i < $.Popup.settings.length; i++) {
            if($.Popup.settings[i].control == control){
                return i;
            }
        };

        return -1;
    }

    $.Popup.CloseLast = function() {
        var popupSettings = $.Popup.settings[$.Popup.settings.length - 1];
        if (!popupSettings) {
            window.generic.statusLogging("No popup to close");
            return;
        }
        $.Popup.Close(popupSettings.control);
    }

    function GetPopupSettingsIndex(data) {
        for (var i=0;i<$.Popup.settings.length;++i) {
            if (($.Popup.settings[i].control == data.control) && ($.Popup.settings[i].overlay == data.overlay)) {
                return i;
            }
        }

        return -1;
    }

} (jQuery));

(function ($) {
    var overlay = $.getOrCreate("alertOverlay");
// data
// {
//     title: title,
//     message: text,
//     buttons: buttons,
//     stylePrefix: stylePrefix
// }
    $.alert = function (data) {
        data.buttons = data.buttons || [{ id: "alertOk", text: "Close", focused: true }];
        data.stylePrefix = data.stylePrefix || "alert";
        $.Popup.Show({
            overlay: overlay,
            modalWindow: true,
            title: data.title,
            messages: [{text: data.message}],
            buttons: data.buttons,
            options: data.options,
            dropDown: data.dropDown,
            formSubmit: $.Popup.CloseLast,
            stylePrefix: data.stylePrefix,
            onClose: data.onClose
        });
    }
} (jQuery));

if(isDot2())
{
    window.Overlays = {
        serverDisabledOverlay: {
            overlay:  $.getOrCreate("commonOverlay")[0],
            modalWindow: true,
            messages: [{ text: "Remotes are disabled!|To activate Remotes for this console goto Setup/Global Settings." }],
            stylePrefix: "overlay"
        },

        serverUnavailableOverlay : {
            overlay: $.getOrCreate("commonOverlay")[0],
            modalWindow: true,
            messages:[{text: "Cannot connect to the console!!!"}],
            stylePrefix: "overlay"
        },

        connectionsLimitOverlay:{
            overlay: $.getOrCreate("commonOverlay")[0],
            modalWindow: true,
            messages: [{ text: "Connection limit of 3 devices reached! Can't connect to the console!|Please close connection of any other Remote and try again."}],
            stylePrefix: "overlay"
        }
    };
}
else
{
    window.Overlays = {
        serverDisabledOverlay: {
            overlay:  $.getOrCreate("commonOverlay")[0],
            modalWindow: true,
            messages: [{ text: "Remotes are disabled!|To activate Remotes for this console goto Setup/Console/Global Settings." }],
            stylePrefix: "overlay"
        },

        serverUnavailableOverlay : {
            overlay: $.getOrCreate("commonOverlay")[0],
            modalWindow: true,
            messages:[{text: "Cannot connect to the console!!!"}],
            stylePrefix: "overlay"
        },

        connectionsLimitOverlay:{
            overlay: $.getOrCreate("commonOverlay")[0],
            modalWindow: true,
            messages: [{ text: "Connection limit of 3 devices reached! Can't connect to the console!|Please close connection of any other Remote and try again."}],
            stylePrefix: "overlay"
        }
    };
}
