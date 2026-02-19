#include "Service.h"
#include <algorithm>
#include <numeric>
#include <stdexcept>
#include "concrete_commands.h"



// Add a trench coat
void Service::addTrenchCoat(const std::string& size, const std::string& color, double price, int quantity, const std::string& photo) {
    int newId = static_cast<int>(repo.getAll().size()) + 1;
    TrenchCoat coat(newId, size, color, price, quantity, photo);
    TrenchCoatValidator::validate(coat);
    Command* cmd = new AddCommand(&repo, coat);
    cmdManager.executeCommand(cmd);
}

void Service::removeTrenchCoat(const std::string& size, const std::string& color) {
    TrenchCoat oldCoat = repo.findCoat(size, color);
    Command* cmd = new RemoveCommand(&repo, oldCoat);
    cmdManager.executeCommand(cmd);
}

void Service::updateTrenchCoat(const std::string& size, const std::string& color, double price, int quantity) {
    TrenchCoat dummy(0, size, color, price, quantity, "placeholder");
    TrenchCoatValidator::validate(dummy);
    TrenchCoat oldCoat = repo.findCoat(size, color);
    Command* cmd = new UpdateCommand(&repo, oldCoat, price, quantity);
    cmdManager.executeCommand(cmd);
}
// List all trench coats
std::vector<TrenchCoat> Service::listTrenchCoats() const {
    return repo.getAll();
}

// Filter by size
std::vector<TrenchCoat> Service::getFilteredCoats(const std::string& size) const {
    std::vector<TrenchCoat> filtered;
    const auto& coats = repo.getAll();
    std::copy_if(coats.begin(), coats.end(), std::back_inserter(filtered),
                 [&](const TrenchCoat& c) { return c.getSize() == size; });
    return filtered;
}

// Add coat to basket.txt
void Service::addToBasket(TrenchCoat& coat) {
    TrenchCoatValidator::validate(coat);
    int newId = static_cast<int>(userRepo->getAll().size()) + 1;
    coat.setID(newId);
    userRepo->addCoat(coat);
}

// Return basket.txt contents
std::vector<TrenchCoat> Service::getBasket() const {
    return userRepo->getAll();
}

// Calculate total price
double Service::getTotalBasketPrice() const {
    const auto& basket = userRepo->getAll();
    return std::accumulate(basket.begin(), basket.end(), 0.0,
        [](double sum, const TrenchCoat& c) { return sum + c.getPrice(); });
}

// Show basket.txt in default application
void Service::showBasket() const {
    userRepo->openFile();
}

// Get coat by index
TrenchCoat Service::getTrenchCoatById(int id) const {
    const auto& coats = repo.getAll();
    if (id < 0 || id >= static_cast<int>(coats.size()))
        throw std::out_of_range("Invalid coat index.");
    return coats[id];
}

// Get coat by size with looping
TrenchCoat Service::getTrenchCoatBySize(int& currentIndex, const std::string& size) const {
    std::vector<TrenchCoat> filtered;

    if (size.empty()) {
        filtered = repo.getAll();
    } else {
        const auto& all = repo.getAll();
        std::copy_if(all.begin(), all.end(), std::back_inserter(filtered),
                     [&](const TrenchCoat& c) { return c.getSize() == size; });
    }

    if (filtered.empty())
        throw std::out_of_range("No trench coats for that size.");

    TrenchCoat result = filtered[currentIndex];
    currentIndex = (currentIndex + 1) % static_cast<int>(filtered.size());
    return result;
}

// Add hardcoded coats
void Service::add10() {
    addTrenchCoat("M", "Black", 150.0, 10, "www.youtube.com");
    addTrenchCoat("L", "Red", 120.0, 5, "www.google.com");
    addTrenchCoat("S", "Blue", 100.0, 8, "www.redbull.com");
    addTrenchCoat("M", "Green", 130.0, 12, "www.monsterenergy.com");
    addTrenchCoat("XL", "Yellow", 160.0, 3, "yellow_xl.jpg");
    addTrenchCoat("M", "White", 150.0, 10, "www.youtube.com");
    addTrenchCoat("L", "Purple", 120.0, 5, "www.google.com");
    addTrenchCoat("S", "Turquoise", 100.0, 8, "www.redbull.com");
    addTrenchCoat("M", "Brown", 130.0, 12, "www.monsterenergy.com");
    addTrenchCoat("XL", "Pink", 160.0, 3, "yellow_xl.jpg");
}
void Service::undo() {
    cmdManager.undo();
}

void Service::redo() {
    cmdManager.redo();
}
