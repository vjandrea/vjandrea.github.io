window.uiTypes.Wheel = (function () {
    var EncoderResolution = function () {
    }

    EncoderResolution.values = {
        Normal: 0,
        Fine: 1,
        Ultra: 2
    };

    EncoderResolution.GetName = function (id) {
        for (var name in EncoderResolution.values) {
            if (EncoderResolution.values[name] == id) {
                return name;
            }
        }
        return "";
    }


    var Wheel = function(attributeName, wheelControl, wheelScale) {
        //members
        this.m_wheelControl = wheelControl;
        this.m_wheelScale = wheelScale ? wheelScale : 0;

        this.WheelSelectedCallback = null;
        this.AttrButtonCallback = null;

        var m_stripeControl = null;
        var m_stripeControlPureDOM = null;
        var m_attributeButton = null;
        var m_attributeButtonPureDOM = null;
        var m_attributeNameButton = null;
        var m_attributeButtonValue = null;
        var m_encoderResolutionControl = null;
        var m_encoderResolutionControlPureDOM = null;
        var m_attributeEncoderResolutionList = null;
        var m_wheelHolder = null;
        var m_wheelStripe = null;
        var m_innerWheelStripe = null;

        var m_posValid = false;
        var m_mousePos = 0;
        var m_value = 0;
        var m_attributeId = attributeName;
        var m_encoderResolution = 0;
        var kEncoderResolutionsCount = 3;

        var eventHandlers = null;

        var m_animationImages = ["./images/wheelAnimation0.png", "./images/wheelAnimation1.png", "./images/wheelAnimation2.png", "./images/wheelAnimation3.png", "./images/wheelAnimation4.png", "./images/wheelAnimation5.png",
            "./images/wheelAnimation6.png", "./images/wheelAnimation7.png"];

        var m_animationImagesId = "wheel_animation_images";
        if (! (0 in $("#" + m_animationImagesId))) {
            var forceImagesLoadingHtml = "<div style='display:none' id='" + m_animationImagesId + "'>";
            for (var i = 0; i < m_animationImages.length; i++) {
                forceImagesLoadingHtml += "<img src='" + m_animationImages[i] + "' />";
            }
            forceImagesLoadingHtml+="</div>";
            window.generic.globs.$body.append(forceImagesLoadingHtml);
        }

        var m_curAnimationIndex = -1;

        function GetYpos(e) {
            if (e.targetTouches && (e.targetTouches.length >= 1)) {
                return e.targetTouches[0].clientY;
            }
            return e.clientY;
        }

        function TouchStart(e) {
            m_wheelStripe.addClass('pressedState');
            m_wheelStripe.removeClass("releasedState");
            m_scale = -256 / m_wheelHolder.height();

            if(!window.isDot2())
            {
                m_curAnimationIndex = 0;
                m_innerWheelStripe.css("background-image", "url('" + m_animationImages[m_curAnimationIndex] + "')");
            }

            if (this.WheelSelectedCallback) {
                this.WheelSelectedCallback(m_attributeId);
            }
        }

        function TouchMove(e) {
            var currentY = GetYpos(e.originalEvent || e);
            if (m_posValid) {
                var wheelDelta = (currentY - m_mousePos) * m_scale;
                m_value += wheelDelta;
                BufferEncoderChanges(m_attributeId, wheelDelta);

                if(!window.isDot2())
                {
                    if (wheelDelta) {
                        var operation = wheelDelta < 0 ? window.generic.BoundIncrement : window.generic.BoundDecrement;
                        m_curAnimationIndex = operation(m_curAnimationIndex, 0, m_animationImages.length);
                        m_innerWheelStripe.css("background-image", "url(" + m_animationImages[m_curAnimationIndex] + ")");
                    }
                }
            }
            m_mousePos = currentY;
            m_posValid = true;
        }

        function TouchEnd(e) {
            m_posValid = false;
            m_value = 0;
            m_wheelStripe.removeClass('pressedState');
            m_wheelStripe.addClass("releasedState");

            if(!window.isDot2())
            {
                m_innerWheelStripe.css("background-image", "");
            }
        }

        function attribButtonPressed(e)
        {
            if (this.AttrButtonCallback) {
                this.AttrButtonCallback(m_attributeId);
            }
        }

        function ChangeEncoderResolution() {
            ++m_encoderResolution;
            m_encoderResolution %= kEncoderResolutionsCount;

            BufferEncoderChanges(m_attributeId, undefined, m_encoderResolution);
        }

        this.init = function () {
            m_stripeControl = $(".wheelStripe", this.m_wheelControl);
            m_stripeControlPureDOM = m_stripeControl[0];
            m_encoderResolutionControl = $(".attributeEncoderResolutionButton", this.m_wheelControl);
            m_encoderResolutionControlPureDOM = m_encoderResolutionControl[0];
            m_attributeNameButton = $(".attributeButtonName", this.m_wheelControl);
            m_attributeButton = $(".attributeMainButton", this.m_wheelControl);
            m_attributeButtonPureDOM = m_attributeButton[0];
            m_wheelHolder = $(".wheelHolder", this.m_wheelControl);
            m_wheelStripe = $(".wheelStripe", this.m_wheelControl);
            m_attributeEncoderResolutionList = $(".attributeEncoderResolutionList", this.m_wheelControl);
            m_attributeButtonValue = $(".attributeButtonValue", this.m_wheelControl);
            m_innerWheelStripe = $(".wheelStripeInner", m_wheelHolder);

            eventHandlers = {
                stripe_down: TouchStart.bind(this),
                stripe_up : TouchEnd.bind(this),
                stripe_move: TouchMove.bind(this),
                resolution_down : ChangeEncoderResolution.bind(this),
                attrBtn_click : attribButtonPressed.bind(this)
            };

            this.bind(eventHandlers);
        }

        this.bind = function(eventHandlers){
            m_stripeControlPureDOM.addEventListener(Touch.maTouchDown, eventHandlers.stripe_down);
            m_stripeControlPureDOM.addEventListener(Touch.maTouchMove, eventHandlers.stripe_move);
            m_stripeControlPureDOM.addEventListener(Touch.maTouchUp, eventHandlers.stripe_up);

            if (m_encoderResolutionControlPureDOM) {
                m_encoderResolutionControlPureDOM.addEventListener(Touch.maTouchDown, eventHandlers.resolution_down);
            }

            if(m_attributeButtonPureDOM)
            {
                m_attributeButtonPureDOM.addEventListener(Touch.maTouchDown,eventHandlers.attrBtn_click);
            }
        };

        this.unbind = function(eventHandlers){
            m_stripeControlPureDOM.removeEventListener(Touch.maTouchDown, eventHandlers.stripe_down);
            m_stripeControlPureDOM.removeEventListener(Touch.maTouchMove, eventHandlers.stripe_move);
            m_stripeControlPureDOM.removeEventListener(Touch.maTouchUp, eventHandlers.stripe_up);

            if (m_encoderResolutionControlPureDOM) {
                m_encoderResolutionControlPureDOM.removeEventListener(Touch.maTouchDown, eventHandlers.resolution_down);
            }

            if(m_attributeButtonPureDOM)
            {
                m_attributeButtonPureDOM.removeEventListener(Touch.maTouchDown,eventHandlers.attrBtn_click);
            }
        };

        this.setAttribute = function (attribute) {
            m_attributeId = attribute.id;
            m_encoderResolution = attribute.encoder_resolution;

            m_wheelHolder.attr("id", attribute.id);
            m_attributeNameButton.text(attribute.name);

            $(".highlightedText", m_attributeEncoderResolutionList).removeClass("highlightedText");
            $(":nth-child(" + (parseInt(attribute.encoder_resolution) + 1) + ")", m_attributeEncoderResolutionList).addClass("highlightedText");

            m_attributeButtonValue.text(attribute.value);
            m_attributeButtonValue.css("background-color", attribute.bgColor);
            m_attributeButtonValue.css("color", attribute.color);
        };

        this.show = function () {
            this.m_wheelControl.show();
        }

        this.hide = function () {
            this.m_wheelControl.hide();
        }

        this.dispose = function() {
            this.unbind(eventHandlers);
        };

        //Buffer Encoder Changes Part
        var EncoderTimer = false;
        var EncoderChanges = false;

        function BufferEncoderChanges(attribute_name, delta_value, resolution)
        {
            if (!EncoderTimer)
            {
                EncoderTimer = setInterval(BufferEncoderChangesTimer, 33); // 33 ms = 30 Hz
            }

            if (!EncoderChanges) EncoderChanges = [];

            EncoderChanges[attribute_name] = EncoderChanges[attribute_name] || {};

            if (delta_value !== undefined) {
                if (EncoderChanges[attribute_name].delta_value) {
                    EncoderChanges[attribute_name].delta_value += delta_value;
                } else {
                    EncoderChanges[attribute_name].delta_value = delta_value;
                }
            }

            if (resolution !== undefined) {
                EncoderChanges[attribute_name].resolution = resolution;
            }
        }


        function BufferEncoderChangesTimer()
        {
            if (EncoderChanges)
            {
                for (var key in EncoderChanges)
                {
                    Server.send({
                        requestType: Server.requestTypes.encoder,
                        name: key,
                        value: EncoderChanges[key].delta_value,
                        resolution: EncoderChanges[key].resolution
                    });
                }

                EncoderChanges = false;
            }
            else
            {
                window.clearTimeout(EncoderTimer);
                EncoderTimer = false;
            }
        }
    }

    return Wheel;
})();
