defineNamespace(window, "uiTypes.pages");

(function(ns){
    var FullCommand = function(commandLine, commandExecutor, globalSettings) {
        FullCommand.superclass.constructor.call(this, commandLine, commandExecutor, globalSettings);

        this.requirements = {
            showDimmerWheel: true
        };

        this.$buttonsContainer = $.createItem({ class: "complex-button-container" });
        if(isDot2())
        {
            this.pageCommands = {
                left: [
                    { command: commands.Commands.pause(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.goback(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.go(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands.on(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.off(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.goto(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands._delete(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.copy(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands._empty(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands.edit(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.update(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands._empty(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands.page(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.exec(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.cue(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands.group(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.preset(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.time(), uiElement: commands.ui.UIMultiStateButton() },
                ],
                right: [
                    { command: commands.Commands.fixture(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.oops(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.esc(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.clear(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands._7(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._8(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._9(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.plus(), uiElement: commands.ui.UILabel() },

                    { command: commands.Commands._4(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._5(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._6(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.thru(), uiElement: commands.ui.UILabel() },

                    { command: commands.Commands._1(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._2(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._3(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.minus(), uiElement: commands.ui.UILabel() },

                    { command: commands.Commands._0(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.dot(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._if(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.at(), uiElement: commands.ui.UILabel() },

                    { command: commands.Commands.store(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.full(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.high(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.please(), uiElement: commands.ui.UILabel() }
                ]
            };
        }
        else
        {
            this.pageCommands = {
                left: [
                    { command: commands.Commands.on(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.off(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.select(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands._empty(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands.assign(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.copy(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands._delete(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.time(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands.goto(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.sequence(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.cue(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.exec(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands.macro(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.page(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.group(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.preset(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands.ma(), uiElement: commands.ui.UIStateImageButton() },
                    { command: commands.Commands.edit(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.update(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.store(), uiElement: commands.ui.UIMultiStateButton() }
                ],
                right: [
                    { command: commands.Commands.channelFixtureSwitcher(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.oops(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.esc(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.clear(), uiElement: commands.ui.UIMultiStateButton() },

                    { command: commands.Commands._7(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._8(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._9(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.plus(), uiElement: commands.ui.UILabel() },

                    { command: commands.Commands._4(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._5(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._6(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.thru(), uiElement: commands.ui.UILabel() },

                    { command: commands.Commands._1(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._2(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._3(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.minus(), uiElement: commands.ui.UILabel() },

                    { command: commands.Commands._0(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.dot(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands._if(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.at(), uiElement: commands.ui.UILabel() },

                    { command: commands.Commands.full(), uiElement: commands.ui.UILabel() },
                    { command: commands.Commands.solo(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.high(), uiElement: commands.ui.UIMultiStateButton() },
                    { command: commands.Commands.please(), uiElement: commands.ui.UILabel() }
                ]
            };
        }
        this.pageCommands.left.forEach(commands.ui.initCommandUIElementPair);
        this.pageCommands.right.forEach(commands.ui.initCommandUIElementPair);
        this.commandItems = {
            left: this.pageCommands.left.map(commands.ui.fetchUIElementItems),
            right: this.pageCommands.right.map(commands.ui.fetchUIElementItems),
        };
        this.$page.append(this.$buttonsContainer);
    };
    window.generic.extend(FullCommand, window.uiTypes.pages.Page);

    FullCommand.prototype.Show = function () {
        FullCommand.superclass.Show.call(this);

        this.$leftContainer = $.createItem({ class: "cmd-button-container" });
        this.$rightContainer = $.createItem({ class: "cmd-button-container" });

        if(isDot2())
        {
            ui.Layout.Place(this.$leftContainer, this.commandItems.left, {grid: {columnsCount: 3}});
        }
        else
        {
            ui.Layout.Place(this.$leftContainer, this.commandItems.left, {grid: {columnsCount: 4}});
        }
        ui.Layout.Place(this.$rightContainer, this.commandItems.right, {grid: {columnsCount: 4}});

        if(isDot2())
        {
            ui.Layout.Place(this.$buttonsContainer,[
                { $item: this.$leftContainer, location: {x: "0%", y:"0%", width: "50%", height: "100%"} },
                { $item: this.$rightContainer, location: {x: "50%", y:"0%", width:"50%", height:"100%"} }
            ]);
        }
        else
        {
            ui.Layout.Place(this.$buttonsContainer,[
                { $item: this.$leftContainer, location: {x: "0%", y:"16.66%", width: "50%", height: "83.34%"} },
                { $item: this.$rightContainer, location: {x: "50%", y:"0%", width:"50%", height:"100%"} }
            ]);
        }
        generic.globs.serverCommandManager.addCommands(this.id, this.pageCommands.left.concat(this.pageCommands.right));
    };

    FullCommand.prototype.Close = function () {
        FullCommand.superclass.Close.call(this);

        generic.globs.serverCommandManager.removeCommands(this.id);
        commands.ui.disposeUIElements(this.pageCommands.left);
        commands.ui.disposeUIElements(this.pageCommands.right);
    };

    FullCommand.id = "FullCommand";
    if(isDot2())
    {
        FullCommand.title = "Command";
    }
    else
    {
        FullCommand.title = "CMD";
    }
    FullCommand.content = '<div id="' + FullCommand.id + '"></div>';
    FullCommand.maButtonState = false;

    ns.FullCommand = FullCommand;
})(window.uiTypes.pages);
