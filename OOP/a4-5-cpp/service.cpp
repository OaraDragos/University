#include "service.h"
#include <iostream>

//add a trench coat to the repository
//in- size, color, price, quantity, photo
//out- the trench coat is added to the repository
void Service::addTrenchCoat(const std::string& size, const std::string& color, double price, int quantity, const std::string& photo) {
    if (price < 0 || quantity < 0) {
        std::cerr << "Error: Price and quantity must be non-negative.\n";
        return;
    }
    repo.addcoat(TrenchCoat(repo.getAll().getSize()+1,size, color, price, quantity, photo));
}
//remove a trench coat from the repository
//in- size, color
//out- the trench coat is removed from the repository
void Service::removeTrenchCoat(const std::string& size, const std::string& color) {
    repo.remove(size, color);
}
//update a trench coat from the repository
//in- size, color,new price,new quantity
//out- update the new price and quanity of the trench coat
void Service::updateTrenchCoat(const std::string& size, const std::string& color, double price, int quantity) {
    if (price < 0 || quantity < 0) {
        std::cerr << "Error: Price and quantity must be non-negative.\n";
        return;
    }
    repo.update(size, color, price, quantity);
}
//list all trench coats from the repository
//in- nothing
//out- a vector of all trench coats
DynamicVector<TrenchCoat> Service::listTrenchCoats() const {
    return repo.getAll();
}
TrenchCoat Service::getTrenchCoatbyid(int id) const {
    DynamicVector<TrenchCoat> coats = repo.getAll();
    if (id < 0 || id >= coats.getSize()) {
        throw std::out_of_range("Error: Invalid trench coat index.");
    }
    return coats.getElems()[id];  // Return the trench coat at the specified index
}

void Service::addToBasket( TrenchCoat& coat) {
    coat.setID(userRepo.getAll().getSize() + 1);  // Set a new ID for the coat
    userRepo.addcoat(coat);  // Add the trench coat to the user's basket (userRepo)
}

// Returns the user's shopping basket (all items they added)
DynamicVector<TrenchCoat> Service::getBasket() const {
    return userRepo.getAll();  // Get all trench coats from the user's basket (userRepo)
}

// Returns the total price of the items in the user's shopping basket
double Service::getTotalBasketPrice() const {
    double total = 0.0;

    // Cast away constness and iterate over the basket
    DynamicVector<TrenchCoat>& nonConstBasket = const_cast<DynamicVector<TrenchCoat>&>(userRepo.getAll());

    // Iterate through the basket
    for (auto& coat : nonConstBasket) {
        total += coat.getPrice();
    }

    return total;
}
TrenchCoat Service::getTrenchCoatBySize(int& currentIndex, const std::string& size) const {
    DynamicVector<TrenchCoat> coats = repo.getAll();  // Get all trench coats from the repository

    // If size is provided, filter the coats by size
    DynamicVector<TrenchCoat> filteredCoats;
    if (size.empty()) {
        filteredCoats = coats;  // All coats if size is empty
    } else {
        // Filter coats by the specified size
        for (int i = 0; i < coats.getSize(); ++i) {
            if (coats.getElems()[i].getSize() == size) {
                filteredCoats.add(coats.getElems()[i]);
            }
        }
    }

    if (filteredCoats.getSize() == 0) {
        throw std::out_of_range("Error: No trench coats found for the given size.");
    }

    // Return the trench coat at the current index
    TrenchCoat selectedCoat = filteredCoats.getElems()[currentIndex];

    // Update the current index for the next trench coat (looping through the available coats)
    currentIndex = (currentIndex + 1) % filteredCoats.getSize();

    return selectedCoat;  // Return the selected trench coat
}

void Service::add10() {
    // Constructor implementation
    addTrenchCoat("M", "Black", 150.0, 10, "www.youtube.com");
    addTrenchCoat("L", "Red", 120.0, 5, "www.google.com");
    addTrenchCoat("S", "Blue", 100.0, 8, "www.redbull.com");
    addTrenchCoat("M", "Green", 130.0, 12, "https://www.monsterenergy.com/ro-ro/");
    addTrenchCoat("XL", "Yellow", 160.0, 3, "yellow_xl.jpg");
    addTrenchCoat("M", "White", 150.0, 10, "www.youtube.com");
    addTrenchCoat("L", "Purple", 120.0, 5, "www.google.com");
    addTrenchCoat("S", "Turqoise", 100.0, 8, "www.redbull.com");
    addTrenchCoat("M", "Brown", 130.0, 12, "https://www.monsterenergy.com/ro-ro/");
    addTrenchCoat("XL", "Pink", 160.0, 3, "yellow_xl.jpg");
}