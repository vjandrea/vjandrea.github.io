var GlobalTimers = window.timers.GlobalTimers;

window.uiTypes.pages.Wheels = (function () {
    var PageBase = window.uiTypes.pages.Page;
    var Server = window.Server;
    var requestTypes = Server.requestTypes;

    var Wheels = function(commandLine, commandExecutor, globalSettings) {
        Wheels.superclass.constructor.call(this, commandLine, commandExecutor, globalSettings);

        this.requirements = {
            presetTypeBar: true
        };

        this.topRightButtonText = $(".top-right-button .text");

        this.full_preset_type_init = false;

        this.PresetTypeArray = [];
        this.wheels = [];
        this.wheelsCountPerPage = 4;
        this.wheelsContainer = $("#wheelContainer", this.$page);
        this.allWheels = $(".allWheels", this.wheelsContainer);

        var btn = '<div id="FeatureButton" class="drop-down">';
        if(!isDot2())
        {
            btn += '<embed data-rel="drop-down-sign" class="dropDownSign" type="image/svg+xml" src="./images/dropDownSign.svg"></embed>';
        }
        btn += '</div>';

        this.$featureButton = $(btn);
        this.featureButton = new window.uiTypes.DropDownButton(this.$featureButton);
        this.featureDropDownEnabled = false;

        this.$wheelTemplate = $("*[data-rel=wheel-template]", this.wheelsContainer);

        this.fakeFeaturesSuffixes = "ABCDEFGHIJKLMNOPQRSTUWXYZ";

        this.wheelMaxSpace = 1 / 9;
        this.wheelMinWidth = 60;

        this.currentPresetTypeId = -1;
        this.currentFeatureId = -1;

        this.refresh_context = null;

        this.wheelSelected_context = this.WheelSelected.bind(this);
        this.attrBtnClicked_context = this.AttrBtnClicked.bind(this);

        this.Refresh = function () {
            this.m_commandExecutor.send({
                requestType: requestTypes.presetTypes,
                type: this.full_preset_type_init ? "full" : "update"
            });
            this.full_preset_type_init = false;
        };

        this.AddWheels = function (count, startIndex) {
            if (count <= 0) {
                return;
            }

            var wheelsHtml = "";
            for (var i = startIndex; i < startIndex + count; i++) {
                //var newWheel = $("#wheel" + i, this.allWheels);
                //if (!(0 in newWheel)) {
                    var newWheel = this.$wheelTemplate.clone();
                    newWheel.attr("id", "wheel" + i);
                    this.allWheels.append(newWheel);
                //}

                this.wheels[i] = new window.uiTypes.Wheel("", newWheel);
                this.wheels[i].init();
                this.wheels[i].WheelSelectedCallback = this.wheelSelected_context;
                this.wheels[i].AttrButtonCallback = this.attrBtnClicked_context;
            }
        };

        this.PresetTypesRender = function (consolereturn) {
            if (consolereturn.responseType != requestTypes.presetTypes) {
                return false;
            }

            var selectedPresetType = null;

            for (var i = 0; i < this.PresetTypeArray.length; i++) {
                var presetType = this.PresetTypeArray[i];
                if (presetType.s) {
                    selectedPresetType = presetType;
                }
            }

            switch (consolereturn.type) {
                case "full":
                    this.PresetTypeArray = consolereturn.pre;

                    if (this.PresetTypeArray.length <= 0) {
                        this.wheelsContainer.hide();
                        return;
                    } else {
                        this.wheelsContainer.show();
                    }

                    this.setupFeatureFull(selectedPresetType);
                    return true;
                case "update":
                    $.extend(true, this.PresetTypeArray, consolereturn.pre); // true = deep copy (recursive)
                    this.setupFeatureFull(selectedPresetType);
                    return true;
                default:
                    assert("Wheels.PresetTypesRender: invalid argument 'type'");
                    break;
            }

            return false;
        };

        this.setupFeatureFull = function (selectedPresetType) {
            if (selectedPresetType) {
                var oldWheelsCountPerPage = this.wheelsCountPerPage;
                this.wheelsCountPerPage = Math.min(Math.floor(1 / this.wheelMaxSpace), Math.max(Math.floor(this.wheelsContainer.width() / this.wheelMinWidth), 1));

                var currentSelectedFeatureIndex = 0;
                var features = selectedPresetType.fea;
                var n_features = features.length;
                for (var i = 0; i < n_features; i++) {
                    if (features[i].s) {
                        currentSelectedFeatureIndex = i;
                        break;
                    }
                }

                var selectedFeature = features[currentSelectedFeatureIndex];

                var selectedAttribute = 0;
                var selectedAttributeIndex = 0;
                var attributes = selectedFeature.att;
                for (var i = 0; i < attributes.length; i++) {
                    if (attributes[i].s) {
                        selectedAttribute = attributes[i].i;
                        selectedAttributeIndex = i;
                        break;
                    }
                }

                var currentAttributePageIndex = Math.floor(selectedAttributeIndex / this.wheelsCountPerPage);
                var currentAttributePageFirstIndex = currentAttributePageIndex * this.wheelsCountPerPage;
                var wheelsToShowCount = Math.min(this.wheelsCountPerPage, selectedFeature.att.length - currentAttributePageFirstIndex);

                var multipage = selectedFeature.att.length > this.wheelsCountPerPage;
                this.featureButton.rename(selectedFeature.np + (multipage ? " " + this.fakeFeaturesSuffixes[currentAttributePageIndex] : ""));

                this.featureDropDownEnabled = multipage || n_features > 1;

                // refresh wheels
                {
                    this.allWheels.hide();

                    this.AddWheels(wheelsToShowCount - this.wheels.length, this.wheels.length);

                    var tableWidth = 100 / this.wheelsCountPerPage * wheelsToShowCount;
                    var columnWidth = 100 / wheelsToShowCount;

                    this.allWheels.css("width", tableWidth + "%");

                    for (var i = 0; i < wheelsToShowCount; i++) {
                        var attribute = selectedFeature.att[currentAttributePageFirstIndex + i];

                        this.wheels[i].setAttribute({
                            id: attribute.n,
                            name: attribute.np,
                            encoder_resolution: attribute.encoder_resolution,
                            value: attribute.t,
                            bgColor: attribute.bC,
                            color: attribute.c
                        });
                        this.wheels[i].m_wheelControl.css("width", columnWidth + "%");
                        this.wheels[i].show();
                    }
                    for (var i = wheelsToShowCount; i < this.wheels.length; i++) {
                        this.wheels[i].hide();
                    }

                    this.allWheels.show();
                }

                var needFeatureListUpdate = (this.currentPresetTypeId !== selectedPresetType.i) ||
                    (this.currentFeatureId !== selectedFeature.i) ||
                    (oldWheelsCountPerPage !== this.wheelsCountPerPage);
                this.currentPresetTypeId = selectedPresetType.i;
                this.currentFeatureId = selectedFeature.i;
                if (needFeatureListUpdate) {
                    this.featureButton.updateListData(this.FeatureListUpdate());
                }
            }
        };

        this.FeatureButtonPressed = function () {
            var n_presets = this.PresetTypeArray.length;
            for (var i = 0; i < n_presets; i++) {
                if (this.PresetTypeArray[i].s) {
                    var PresetType = this.PresetTypeArray[i];
                    var Features = PresetType.fea;
                    var n_features = Features.length;
                    for (var j = 0; j < n_features; j++) {
                        var feature = Features[j];
                        if (feature.s) {
                            for (var k = 0; k < feature.att.length; k++) {
                                var attribute = feature.att[k];
                                if (attribute.s) {
                                    var attributePagesCount = Math.floor((feature.att.length - 1) / this.wheelsCountPerPage + 1);
                                    var currentAttributePageIndex = Math.floor(k / this.wheelsCountPerPage);

                                    if (currentAttributePageIndex < (attributePagesCount - 1)) {
                                        var nextAttribute = feature.att[(currentAttributePageIndex + 1) * this.wheelsCountPerPage];
                                        this.m_commandExecutor.send({ command: this.m_commandLine.getText()+" Att " + nextAttribute.i });
                                    } else {
                                        var cmdText = this.m_commandLine.getText();
                                        if(cmdText != "")
                                        {
                                            var currFeature = Features[j];
                                            this.m_commandExecutor.send({ command: this.m_commandLine.getText()+" FEA " + currFeature.i });
                                        }
                                        else
                                        {
                                            j = (j + 1) % n_features;
                                            var nextFeature = Features[j];
                                            this.m_commandExecutor.send({ command: "FEA " + nextFeature.i });
                                        }
                                    }
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        }

        this.FeatureListUpdate = function() {
            var features;
            var n_presets = this.PresetTypeArray.length;
            for (var i = 0; i < n_presets; i++) {
                if (this.PresetTypeArray[i].s) {
                    features = this.ReorderFeatures(this.PresetTypeArray[i].fea);
                    break;
                }
            }

            return features;
        }

        this.ReorderFeatures = function(features) {
            var reordered = [];
            for (var i = 0; i < features.length; i++) {
                if (features[i].att.length <= this.wheelsCountPerPage) {
                    reordered.push(features[i]);
                } else {
                    var j = features[i].att.length;
                    for (var k = 0; j > 0; ++k) {
                        reordered.push({
                            att: features[i].att.slice(k * this.wheelsCountPerPage, Math.min((k + 1) * this.wheelsCountPerPage, features[i].att.length)),
                            p: features[i].p + " " + this.fakeFeaturesSuffixes[k],
                            np: features[i].np + " " + this.fakeFeaturesSuffixes[k],
                            i: features[i].i
                        });

                        j -= this.wheelsCountPerPage;
                    }
                }
            }

            return reordered;
        }

        this.getFeatureDropDownEnabled_context = this.getFeatureDropDownEnabled.bind(this);
        this.FeatureSelected_context = this.FeatureSelected.bind(this);
        this.featureButtonCreateItem_context = this.featureButtonCreateItem.bind(this);
    }
    window.generic.extend(Wheels, window.uiTypes.pages.Page);
    Wheels.id = "wheels";
    Wheels.title = "Wheels";
    Wheels.content =
    '<div id="' + Wheels.id + '">' +
        '<div id="wheelContainer">' +
            '<div class="allWheels">' +
            '</div>' +

            '<div class="hidden">' +
                '<div data-rel="wheel-template" class="wheel">' +
                    '<div class="attributeButtons">' +
                        '<div class="attributeMainButton">' +
                            '<div class="attributeButtonName">' +
                            '</div>' +
                            '<div class="attributeButtonValue">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="attributeEncoderResolutionButton">' +
                        '<ul class="attributeEncoderResolutionList">' +
                            '<li class="attributeEncoderResolutionNormal">Normal</li>' +
                            '<li class="attributeEncoderResolutionFine">Fine</li>' +
                            '<li class="attributeEncoderResolutionUltra">Ultra</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div class="wheelHolder">' +
                        '<div class="wheelStripe">' +
                            '<div class="wheelStripeInner">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

    Wheels.prototype.CreatePageButtons = function() {
        if (!this.pageButtons) {
            this.pageButtons = [
                { $item: this.$featureButton }
            ];
        }

        return this.pageButtons;
    };

    Wheels.prototype.WheelSelected = function (wheelId) {
        this.m_commandExecutor.send({ command: "Att " + wheelId });
    };

    Wheels.prototype.AttrBtnClicked = function (wheelId) {
        this.m_commandExecutor.send({ command: this.m_commandLine.getText()+" Att " + wheelId });
    };

    Wheels.prototype.getFeatureDropDownEnabled = function() {
        return this.featureDropDownEnabled;
    };

    Wheels.prototype.FeatureSelected = function (event) {
        event.preventDefault();
        var attributeId = $(event.data).attr('attributeId');
        if (attributeId) {
            this.m_commandExecutor.send({ command: "ATT " + attributeId });
        }

        this.featureButton.close();
    };

    Wheels.prototype.featureButtonCreateItem = function(item) {
        var $item = $("<div class='drop-down-item' attributeId='" + item.att[0].i + "'>" + item.np + "</div>");
        $item.bind(Touch.maTouchDown, $item, this.FeatureSelected_context);
        return $item;
    };

    Wheels.prototype.Show = function () {
        Wheels.superclass.Show.call(this);

        this.OnResize();

        this.full_preset_type_init = true;
        this.refresh_context = this.Refresh.bind(this);
        GlobalTimers.AddRefreshTimerEventHandler(this.refresh_context);
        DataHandlerManager.Register({ name: this.id + "DataHandler", handler: this.PresetTypesRender.bind(this) });

        this.AddWheels(this.wheelsCountPerPage, 0);

        this.topRightButtonText.text("Back");

        this.featureButton.init({
            OnTap: this.FeatureButtonPressed.bind(this),
            canExecuteDropDown: this.getFeatureDropDownEnabled_context,
            $container: $('<div class="drop-down-container"></div>'),
            createItem: this.featureButtonCreateItem_context
        });

        $(this).triggerHandler(PageBase.events.pageButtonsChanged, { buttons: this.CreatePageButtons() });
    };

    Wheels.prototype.OnResize = function () {
        Wheels.superclass.OnResize.call(this);

        window.generic.statusLogging("resize");

        this.featureButton.updateListRect({
            left: Math.floor(this.$page.offset().left),
            top: Math.floor(this.$page.offset().top),
            width: Math.floor(this.$page.width()),
            height: Math.floor(this.$page.height())
        });
    };

    Wheels.prototype.Close = function () {
        Wheels.superclass.Close.call(this);

        if (!this.refresh_context) {
            window.generic.statusLogging("I'm memory leak");
        }

        GlobalTimers.RemoveRefreshTimerEventHandler(this.refresh_context);
        this.refresh_context = null;
        DataHandlerManager.Unregister(this.id + "DataHandler");

        if (this.featureButton) {
            this.featureButton.dispose();
            this.featureButton = null;
        }

        this.topRightButtonText.text("Wheels");

        for (var i = 0; i < this.wheels.length; i++) {
            this.wheels[i].dispose();
        }
    }

    return Wheels;
})();
