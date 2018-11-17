defineNamespace(window, "uiTypes");

(function (ns) {
    var actions = window.uiTypes.pages.actions.playbacks;

    var ButtonComponent = React.createClass({
        getInitialState: function() {
            return {data: this.props.data};
        },
        render: function () {

            var className = "vertical-bar_item playbacks-bar_item";
            if (this.props.data.a) {
                className += " vertical-bar_item__active playbacks-bar_item__active";
            }
            if (this.props.data.d) {
                className += " vertical-bar_item__disabled playbacks-bar_item__disabled";
            }

            return <div className="vertical-bar_item-wrapper playbacks-bar_item_wrapper" ref="item">
                <div className={ className } id={ this.props.data.id }>
                    <div className="content"> { this.props.data.t || "" } </div>
                </div>
            </div>;
        },
        componentDidMount: function() {
            var domNode = React.findDOMNode(this.refs.item);
            domNode.addEventListener(Touch.maTouchUp, this.props.handler);
        },
        componentWillUnmount: function () {
            var domNode = React.findDOMNode(this.refs.item);
            domNode.removeEventListener(Touch.maTouchUp, this.props.handler);
        }
    });

    var ButtonGroupComponent = React.createClass({
        getInitialState: function() {
            return {data: this.props.data};
        },
        render: function () {
            return <div className="vertical-bar_group playbacks-bar_group">{this.props.children}</div>;
        }
    });

    var PlaybacksPagingBarComponent = React.createClass({
        getInitialState: function() {
            if (!this.props.dispatcher) {
                error("PlaybacksPagingBarComponent: No dispatcher object supplied");
            }

            return {data: this.props.data};
        },
        render: function () {

            var buttonGroups = [];

            buttonGroups.push(
                <ButtonGroupComponent>
                    <ButtonComponent key="prev" data={this.state.data.previous} handler={this.itemIndexChanged.bind(this, -1)} />
                    <ButtonComponent key="next" data={this.state.data.next} handler={this.itemIndexChanged.bind(this, +1)} />
                </ButtonGroupComponent>
            );

            buttonGroups.push(
                <ButtonGroupComponent>
                    <ButtonComponent key="pageDown" data={this.state.data.pageDown} handler={this.pageIndexChanged.bind(this, -1)} />
                    <ButtonComponent key="pageUp" data={this.state.data.pageUp} handler={this.pageIndexChanged.bind(this, +1)} />
                </ButtonGroupComponent>
            );

            var modeItems = [];
            for (var key in this.state.data.modes) {
                var componentKey = "mode_" + this.state.data.modes[key].t;
                modeItems.push(<ButtonComponent key={componentKey} data={this.state.data.modes[key]} handler={this.modeChanged.bind(this, this.state.data.modes[key].v)}/>);
            }

            buttonGroups.push(<ButtonGroupComponent>{ modeItems }</ButtonGroupComponent>);

            return <div className="vertical-bar playbacks-bar">{ buttonGroups }</div>;
        },
        itemIndexChanged: function (direction) {
            this.props.dispatcher.trigger({
                type: actions.ITEM_INDEX_CHANGED,
                data: direction
            });
        },
        pageIndexChanged: function (direction) {
            this.props.dispatcher.trigger({
                type: actions.PAGE_INDEX_CHANGED,
                data: direction
            });
        },
        modeChanged: function (newModeValue) {
            this.props.dispatcher.trigger({
                type: actions.MODE_CHANGED,
                data: newModeValue
            });
        }
    });

    var Paginator = window.uiTypes.pages.Paginator;

    var PlaybacksDataControl = function (storage, $parent, dispatcher) {
        this.storage = storage;
        this.$parent = $parent;
        this.m_dispatcher = dispatcher;
        this.m_currentModeModel = {};

        this.$container = $("<div class='universal-container'></div>");
        if (this.$parent) {
            this.$parent.append(this.$container);
        }
        assert(this.storage, "PlaybacksDataControl: invalid storage argument");

        this.isActive = false;

        this.model = {
            previous: {},
            current: {},
            next: {},
            pageDown: {},
            pageUp: {},
            modes: []
        };

        if (this.m_dispatcher) {
            actionsRegister(this.m_dispatcher, this.m_actions);
        }

        this.m_actions = {
            itemIndexChanged: {
                type: actions.ITEM_INDEX_CHANGED,
                handler: itemsMove.bind(this)
            },
            pageIndexChanged: {
                type: actions.PAGE_INDEX_CHANGED,
                handler: pagesMove.bind(this)
            },
            modeChanged: {
                type: actions.MODE_CHANGED,
                handler: modeChanged.bind(this)
            }
        };

        this.playbackBarInstance = null;
    };

    PlaybacksDataControl.prototype.init = function (data) {
        this.paginatorItems = new Paginator();
        this.paginatorPages = new Paginator();

        this.setParameters(data, true);

        var currentModeValue = this.__getModeValue();
        if(isDot2())
        {
            this.paginatorItems.setCurrentIndex(this.storage.load("dot2_itemIndex_" + currentModeValue, 0));
            this.paginatorPages.setCurrentIndex(this.storage.load("dot2_pageIndex", 0));
        }
        else
        {
            this.paginatorItems.setCurrentIndex(this.storage.load("itemIndex_" + currentModeValue, 0));
            this.paginatorPages.setCurrentIndex(this.storage.load("pageIndex_" + currentModeValue, 0));
        }

        this.playbackBarInstance = React.render(<PlaybacksPagingBarComponent data={this.model} dispatcher={this.m_dispatcher}/>, this.$container[0]);
    };

// #region Interface

    PlaybacksDataControl.prototype.dispose = function () {
        this.deactivate();
        if (this.playbackBarInstance) {
            actionsUnregister(this.m_dispatcher, this.m_actions);

            this.playbackBarInstance.unmountComponentAtNode(this.$container[0]);
            this.playbackBarInstance = null;
            this.$container.remove();
        }
    };

    PlaybacksDataControl.prototype.setParameters = function (data, init) {
        var currentModeValue = this.__getModeValue();

        var activeModeKey = 0;
        var defaultModeKey = 0;
        for(var key in data) {
            defaultModeKey = defaultModeKey || key;
            if (data[key]) {
                if (data[key].v == currentModeValue) {
                    activeModeKey = key;
                    break;
                }

                if (data[key].a) {
                    defaultModeKey = key;
                }
            }
        }

        var currentMode = data[activeModeKey || defaultModeKey];

        if (currentMode.itemsIndexOffset !== undefined) {
            this.paginatorItems.setOffset(currentMode.itemsIndexOffset);
        }

        if (currentMode.itemsCount !== undefined) {
            this.paginatorItems.setItemsCount(currentMode.itemsCount);
        }
        if (currentMode.itemsStep !== undefined) {
            this.paginatorItems.setStep(currentMode.itemsStep);
        }
        if(isDot2())
        {
            this.paginatorItems.setCurrentIndex(this.storage.load("dot2_itemIndex_" + currentMode.v, 0));
        }
        else
        {
            this.paginatorItems.setCurrentIndex(this.storage.load("itemIndex_" + currentMode.v, 0));
        }

        if (currentMode.pagesCount !== undefined) {
            this.paginatorPages.setItemsCount(currentMode.pagesCount);
        }
        if (currentMode.pagesStep !== undefined) {
            this.paginatorPages.setStep(currentMode.pagesStep);
        }
        if(isDot2())
        {
            this.paginatorPages.setCurrentIndex(this.storage.load("dot2_pageIndex", 0));
        }
        else
        {
            this.paginatorPages.setCurrentIndex(this.storage.load("pageIndex_" + currentMode.v, 0));
        }

        updateModeListModel.call(this, data);
        updateModeModel.call(this, currentMode, init);

        updateItemsModel.call(this, this.paginatorItems.getIndices(init), this.getMode().v, init);
        updatePagesModel.call(this, this.paginatorPages.getIndices(init), this.getMode().v, init);
    };

    PlaybacksDataControl.prototype.activate = function () {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
        if (this.$parent) {
            this.$parent.append(this.$container);
        }
    };

    PlaybacksDataControl.prototype.deactivate = function () {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;

        this.$container.detach();
    };

    PlaybacksDataControl.prototype.refresh = function() {
        this.playbackBarInstance.setState({ data: this.model });
    };

    PlaybacksDataControl.prototype.setParent = function ($parent) {
        $parent.append(this.$container);
        this.$parent = $parent;
    };

    PlaybacksDataControl.prototype.setDispatcher = function (dispatcher) {
        actionsUnregister(this.m_dispatcher, this.m_actions);
        this.m_dispatcher = dispatcher;
        actionsRegister(this.m_dispatcher, this.m_actions);
    };

    PlaybacksDataControl.prototype.getItemsData = function () {
        var pageItemsModel = this.paginatorItems.getIndices();
        var indexes = [];
        var counts = [];
        for(var i = 0; i < this.paginatorItems.itemsCount.length; i++)
        {
            indexes.push(pageItemsModel.current[i].startIndex);
            counts.push(pageItemsModel.current[i].endIndex - pageItemsModel.current[i].startIndex + 1);
        }
        return {
            index: indexes,
            count: counts
        };
    };

    PlaybacksDataControl.prototype.getPagesData = function () {
        var pagesModel = this.paginatorPages.getIndices();
        if(pagesModel.current && pagesModel.current[0])
        {
            return {
                index: pagesModel.current[0].pageIndex
            };
        }
        else
        {
            return {
                index: 0
            };
        }
    };

    PlaybacksDataControl.prototype.getMode = function (modeValue) {
        var defaultResult = {
            t: "",
            v: 0,
            a: true
        };

        if (!this.model || !this.model.modes) {
            return defaultResult;
        }

        var modeValue = modeValue || this.__getModeValue();
        var modeKey = 0;
        for(var key in this.model.modes) {
            modeKey = modeKey || key;
            if (modeValue == this.model.modes[key].v) {
                modeKey = key;
                break;
            }
        }
        return this.model.modes[modeKey] || defaultResult;
    };

// #endregion

    PlaybacksDataControl.prototype.__getModeValue = function () {
        if(isDot2())
        {
            return this.storage.load("dot2_mode", window.uiTypes.playbacks.PlaybacksViewMode.faders);
        }
        else
        {
            return this.storage.load("mode", window.uiTypes.playbacks.PlaybacksViewMode.faders);
        }
    };

// #region Actions handlers

    function itemsMove(type, direction) {
        if (direction < 0) {
            this.paginatorItems.stepBackward();
        } else if (direction > 0) {
            this.paginatorItems.stepForward();
        } else {
            return;
        }

        updateItemsModel.call(this, this.paginatorItems.getIndices(), this.getMode().v);
    }

    function pagesMove(type, direction) {
        if (direction < 0) {
            this.paginatorPages.stepBackward();
        } else if (direction > 0) {
            this.paginatorPages.stepForward();
        } else {
            return;
        }

        updatePagesModel.call(this, this.paginatorPages.getIndices(), this.getMode().v);
    }

    function modeChanged(type, modeValue) {
        updateModeModel.call(this, this.getMode(modeValue));
    }

    function actionsRegister(dispatcher, actions) {
        if (!dispatcher) {
            warning("actionsRegister: invalid dispatcher argument");
            return;
        }

        for(var key in actions) {
            dispatcher.register(actions[key]);
        }
    }

    function actionsUnregister(dispatcher, actions) {
        if (!dispatcher) {
            return;
        }

        for(var key in actions) {
            dispatcher.unregister(actions[key]);
        }
    }

// #endregion

// #region Update model

    function updateItemsModel(pageItemsModel, mode, init) {
        if(!init) {
            var indeces = []
            for(var i = 0; i < pageItemsModel.current.length; i++)
            {
                indeces.push(pageItemsModel.current[i].startIndex);
            }
            if(isDot2())
            {
                this.storage.save("dot2_itemIndex_" + mode, JSON.stringify(indeces), true);
            }
            else
            {
                this.storage.save("itemIndex_" + mode, JSON.stringify(indeces), true);
            }
        }

        this.model.previous.d = !pageItemsModel.previous.length;
        this.model.previous.t = this.model.previous.d ? "Previous" :  "Previous " + (pageItemsModel.previous[0].startIndex + 1) + "-" + (pageItemsModel.previous[0].endIndex + 1);

        this.model.current.a = true;
        this.model.current.t = "Current " + (pageItemsModel.current[0].startIndex + 1) + "-" + (pageItemsModel.current[0].endIndex + 1);

        this.model.next.d = !pageItemsModel.next.length;
        this.model.next.t = this.model.next.d ? "Next" : "Next " + (pageItemsModel.next[0].startIndex + 1) + "-" + (pageItemsModel.next[0].endIndex + 1);
    }

    function updatePagesModel(pagesModel, mode, init) {
        if(!init) {
            var indeces = []
            for(var i = 0; i < pagesModel.current.length; i++)
            {
                indeces.push(pagesModel.current[i].pageIndex);
            }
            if(isDot2())
            {
                this.storage.save("dot2_pageIndex", JSON.stringify(indeces), true);
            }
            else
            {
                this.storage.save("pageIndex_" + mode, JSON.stringify(indeces), true);
            }
        }

        this.model.pageDown.d = !pagesModel.previous.length;
        this.model.pageDown.t = "Previous page " + (this.model.pageDown.d ? "" : (pagesModel.previous[0].pageIndex + 1));

        this.model.pageUp.d = !pagesModel.next.length;
        this.model.pageUp.t = "Next page " + (this.model.pageUp.d ? "" : (pagesModel.next[0].pageIndex + 1));
    }

    function updateModeModel(mode, init) {
        if(!init) {
            if(isDot2())
            {
                this.storage.save("dot2_mode", mode.v, true);
            }
            else
            {
                this.storage.save("mode", mode.v, true);
            }
        }

        this.m_currentModeModel = mode;
        for(var key in this.model.modes) {
            this.model.modes[key].a = (this.model.modes[key].v == mode.v);
        }
    }

    function updateModeListModel(modes) {
        this.model.modes = modes;
    }
// #endregion

    ns.PlaybacksDataControl = PlaybacksDataControl;
})(window.uiTypes);
