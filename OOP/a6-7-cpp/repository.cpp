#include "Repository.h"
#include <algorithm>
#include <fstream>
#include <iostream>

Repository::Repository(const std::string& fileName) : fileName(fileName) {
    loadFromFile();
}

void Repository::loadFromFile() {
    std::ifstream fin(fileName);
    if (!fin.is_open()) {
        std::cerr << "Could not open file: " << fileName << "\n";
        return;
    }

    std::string size, color, photo;
    double price;
    int quantity;

    int idCounter = 1;

    while (fin >> size >> color >> price >> quantity) {
        fin.ignore(); // ignore space/newline before getline
        std::getline(fin, photo);
        TrenchCoat coat(idCounter++, size, color, price, quantity, photo);
        coats.push_back(coat);
    }

    fin.close();
}

void Repository::saveToFile() {
    std::ofstream fout(fileName);
    if (!fout.is_open()) {
        std::cerr << "Could not open file: " << fileName << "\n";
        return;
    }

    for (const auto& coat : coats) {
        fout << coat;
    }

    fout.close();
}

void Repository::addCoat(const TrenchCoat& coat) {
    auto it = std::find_if(coats.begin(), coats.end(), [&](const TrenchCoat& c) {
        return c.getSize() == coat.getSize() && c.getColor() == coat.getColor();
    });

    if (it != coats.end()) {
        throw RepositoryException("A coat with this size and color already exists.");
    }

    coats.push_back(coat);
    saveToFile();
}

void Repository::remove(const std::string& size, const std::string& color) {
    auto it = std::remove_if(coats.begin(), coats.end(), [&](const TrenchCoat& c) {
        return c.getSize() == size && c.getColor() == color;
    });

    if (it == coats.end()) {
        throw RepositoryException("Coat not found for removal.");
    }

    coats.erase(it, coats.end());
    saveToFile();
}

void Repository::update(const std::string& size, const std::string& color, double newPrice, int newQuantity) {
    auto it = std::find_if(coats.begin(), coats.end(), [&](TrenchCoat& c) {
        return c.getSize() == size && c.getColor() == color;
    });

    if (it == coats.end()) {
        throw RepositoryException("Coat not found for update.");
    }

    it->setPrice(newPrice);
    it->setQuantity(newQuantity);
    saveToFile();
}

const std::vector<TrenchCoat>& Repository::getAll() const {
    return coats;
}

//Separator
