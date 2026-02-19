#ifndef COMMANDMANAGER_H
#define COMMANDMANAGER_H

#include <stack>
#include "command.h"

class CommandManager {
private:
    std::stack<Command*> undoStack;
    std::stack<Command*> redoStack;

public:
    ~CommandManager() {
        while (!undoStack.empty()) {
            delete undoStack.top();
            undoStack.pop();
        }
        while (!redoStack.empty()) {
            delete redoStack.top();
            redoStack.pop();
        }
    }

    void executeCommand(Command* cmd) {
        cmd->execute();
        undoStack.push(cmd);
        // Clear redoStack after new command
        while (!redoStack.empty()) {
            delete redoStack.top();
            redoStack.pop();
        }
    }

    void undo() {
        if (!undoStack.empty()) {
            Command* cmd = undoStack.top();
            undoStack.pop();
            cmd->undo();
            redoStack.push(cmd);
        }
    }

    void redo() {
        if (!redoStack.empty()) {
            Command* cmd = redoStack.top();
            redoStack.pop();
            cmd->execute();
            undoStack.push(cmd);
        }
    }
};

#endif
