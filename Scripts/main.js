const Config = require("./config");
const IssueProvider = require("./provider");
const Formatter = require("./Formatter");

exports.activate = function () {
    const issueProvider = new IssueProvider(Config);
    const formatter = new Formatter(Config);

    console.info(`Executable path: ${Config.executablePath()}`);
    console.info(`Command (check) arguments: ${Config.commandArguments()}`);
    console.info(`Check mode: ${Config.checkMode()}`);
    console.info(`Command (format) arguments: ${Config.commandFormatArguments()}`);
    console.info(`Format on save: ${Config.formatOnSave()}`);
    console.info(`Organize on save: ${Config.organizeOnSave()}`);

    var assistant = null;

    for (c of [nova.config, nova.workspace.config]) {
        c.observe(`${nova.extension.identifier}.checkMode`, () => {
            if (assistant) {
                assistant.dispose();
                assistant = null;
            }

            const checkMode = Config.checkMode();

            if (checkMode !== "-") {
                assistant = nova.assistants.registerIssueAssistant(
                    "python", issueProvider, { "event": checkMode }
                );
            }
        });
    }

    nova.commands.register("checkWithRuff", (editor) => {
        issueProvider.check(editor);
    });

    nova.workspace.onDidAddTextEditor((editor) => {
        if (editor.document.syntax !== "python") { 
            return;
        } 
        if (Config.formatOnSave()) {
            editor.onWillSave(formatter.formatOnSave, formatter);
        }
        if (Config.organizeOnSave()) {
            editor.onWillSave(issueProvider.organizeOnSave, issueProvider);
        }
        if (Config.removeUnusedImportsOnSave() && !editor.document.uri.endsWith("__init__.py")) {
            editor.onWillSave(issueProvider.removeUnusedImportsOnSave, issueProvider);
        }
    });

    nova.commands.register("formatWithRuff", formatter.format, formatter);
    nova.commands.register(
        "formatWorkspaceWithRuff", formatter.formatWorkspace, formatter
    );
    nova.commands.register("fixWithRuff", (editor) => {
        issueProvider.fix(editor, "ALL", null);
    });
    nova.commands.register("organizeWithRuff", (editor) => {
        issueProvider.fix(editor, null, "I");
    });
}
