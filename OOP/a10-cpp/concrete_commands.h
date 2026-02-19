#ifndef CONCRETE_COMMANDS_H
#define CONCRETE_COMMANDS_H

#include "command.h"
#include "repository.h"

class AddCommand : public Command {
private:
    Repository* repo;
    TrenchCoat coat;

public:
    AddCommand(Repository* repo, const TrenchCoat& coat);
    void execute() override;
    void undo() override;
};

class RemoveCommand : public Command {
private:
    Repository* repo;
    TrenchCoat removedCoat;

public:
    RemoveCommand(Repository* repo, const TrenchCoat& coat);
    void execute() override;
    void undo() override;
};

class UpdateCommand : public Command {
private:
    Repository* repo;
    TrenchCoat oldCoat;
    double newPrice;
    int newQuantity;

public:
    UpdateCommand(Repository* repo, const TrenchCoat& oldCoat, double newPrice, int newQuantity);
    void execute() override;
    void undo() override;
};

#endif
