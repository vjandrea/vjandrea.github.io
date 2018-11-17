window.uiTypes.pages.Command1 = (function(){
    var Command1 = function(commandLine, commandExecutor, globalSettings) {
        Command1.superclass.constructor.call(this, commandLine, commandExecutor, globalSettings);

        this.requirements = {
            showDimmerWheel: true
        };

        this.$buttonsContainer = $.createItem({ class: "button-container" });
        if(isDot2())
        {
            this.pageCommands = [
                { command: commands.Commands.fixtureGroupPresetSwitcher(), uiElement: commands.ui.UILabel() },
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

                { command: commands.Commands.storeUpdateSwitcher(), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.Commands.execCueSwitch(), uiElement: commands.ui.UILabel() },
                { command: commands.Commands.high(), uiElement: commands.ui.UIMultiStateButton() },
                { command: commands.Commands.please(), uiElement: commands.ui.UILabel() }
            ];
        }
        else
        {
            this.pageCommands = [
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
            ];
        }
        this.pageCommands.forEach(commands.ui.initCommandUIElementPair);
        this.commandItems = this.pageCommands.map(commands.ui.fetchUIElementItems);
        this.$page.append(this.$buttonsContainer);
    }
    window.generic.extend(Command1, window.uiTypes.pages.Page);

    Command1.prototype.Show = function () {
        Command1.superclass.Show.call(this);

        ui.Layout.Place(this.$buttonsContainer, this.commandItems, { grid: { columnsCount:4 } });
        generic.globs.serverCommandManager.addCommands(this.id, this.pageCommands);
    };

    Command1.prototype.Close = function () {
        Command1.superclass.Close.call(this);
        generic.globs.serverCommandManager.removeCommands(this.id);
        commands.ui.disposeUIElements(this.pageCommands);
    };

    Command1.id = "command1";
    if(isDot2())
    {
        Command1.title = "Command";
    }
    else
    {
        Command1.title = "CMD 1";
    }
    Command1.content = '<div id="' + Command1.id + '"></div>';

    return Command1;
})();
