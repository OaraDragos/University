#include "concrete_commands.h"

AddCommand::AddCommand(Repository* repo, const TrenchCoat& coat) : repo(repo), coat(coat) {}
void AddCommand::execute() { repo->addCoat(coat); }
void AddCommand::undo() { repo->remove(coat.getSize(), coat.getColor()); }

RemoveCommand::RemoveCommand(Repository* repo, const TrenchCoat& coat) : repo(repo), removedCoat(coat) {}
void RemoveCommand::execute() { repo->remove(removedCoat.getSize(), removedCoat.getColor()); }
void RemoveCommand::undo() { repo->addCoat(removedCoat); }

UpdateCommand::UpdateCommand(Repository* repo, const TrenchCoat& oldCoat, double newPrice, int newQuantity)
    : repo(repo), oldCoat(oldCoat), newPrice(newPrice), newQuantity(newQuantity) {}

void UpdateCommand::execute() {
    repo->update(oldCoat.getSize(), oldCoat.getColor(), newPrice, newQuantity);
}

void UpdateCommand::undo() {
    repo->update(oldCoat.getSize(), oldCoat.getColor(), oldCoat.getPrice(), oldCoat.getQuantity());
}
