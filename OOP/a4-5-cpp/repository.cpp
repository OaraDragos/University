#include "repository.h"
#include <iostream>

void DynamicRepository::addcoat(const TrenchCoat& coat) {
    for (auto it = coats.begin(); it != coats.end(); ++it) {
        if (it->getSize() == coat.getSize() && it->getColor() == coat.getColor()) {
            throw std::runtime_error("Error: A coat with this size and color already exists.");
        }
    }
    coats.add(coat);
}

void DynamicRepository::remove(const std::string& size, const std::string& color) {
    int index = 0;
    bool found = false;

    for (auto it = coats.begin(); it != coats.end(); ++it, ++index) {
        if (it->getSize() == size && it->getColor() == color) {
            coats.remove(index);
            found = true;
            break;
        }
    }

    if (!found) {
        throw std::runtime_error("Error: Coat not found.");
    }
}

void DynamicRepository::update(const std::string& size, const std::string& color, double newPrice, int newQuantity) {
    for (auto it = coats.begin(); it != coats.end(); ++it) {
        if (it->getSize() == size && it->getColor() == color) {
            it->setPrice(newPrice);
            it->setQuantity(newQuantity);
            return;
        }
    }

    throw std::runtime_error("Error: Coat not found.");
}

const DynamicVector<TrenchCoat>& DynamicRepository::getAll() const {
    return coats;
}