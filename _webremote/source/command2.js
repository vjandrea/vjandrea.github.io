window.uiTypes.pages.Command2 = (function(){
    var Command2 = function(commandLine, commandExecutor, globalSettings) {
        Command2.superclass.constructor.call(this, commandLine, commandExecutor, globalSettings);

        this.requirements = {
            showDimmerWheel: true
        };

        this.$buttonsContainer = $.createItem({ class: "button-container" });
        this.pageCommands = [
            { command: commands.Commands.empty(), uiElement: commands.ui.UILabel() },
            { command: commands.Commands.oops(), uiElement: commands.ui.UILabel() },
            { command: commands.Commands.esc(), uiElement: commands.ui.UILabel() },
            { command: commands.Commands.clear(), uiElement: commands.ui.UIMultiStateButton() },

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
            { command: commands.Commands.store(), uiElement: commands.ui.UIMultiStateButton() },
        ];
        this.pageCommands.forEach(commands.ui.initCommandUIElementPair);
        this.commandItems = this.pageCommands.map(commands.ui.fetchUIElementItems);
        this.$page.append(this.$buttonsContainer);
    }
    window.generic.extend(Command2, window.uiTypes.pages.Page);

    Command2.prototype.Show = function () {
        Command2.superclass.Show.call(this);

        ui.Layout.Place(this.$buttonsContainer, this.commandItems, { grid: { columnsCount: 4 } });
        generic.globs.serverCommandManager.addCommands(this.id, this.pageCommands);
    };
    Command2.prototype.Close = function () {
        Command2.superclass.Close.call(this);
        generic.globs.serverCommandManager.removeCommands(this.id);
        commands.ui.disposeUIElements(this.pageCommands);
    };

    Command2.id = "command2";
    Command2.title = "CMD 2";
    Command2.content = '<div id="' + Command2.id + '"></div>';
    Command2.maButtonState = false;

    return Command2;
})();
