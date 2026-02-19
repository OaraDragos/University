#ifndef REPOSITORY_H
#define REPOSITORY_H
#pragma once

#include "domain.h"
#include <vector>
#include <string>

class Repository {
private:
    std::vector<TrenchCoat> coats;
    std::string fileName;

    void loadFromFile();


public:
    void saveToFile();
    Repository(const std::string& fileName);
    void addCoat(const TrenchCoat& coat);
    void remove(const std::string& size, const std::string& color);
    void update(const std::string& size, const std::string& color, double newPrice, int newQuantity);
    const std::vector<TrenchCoat>& getAll() const;
};


#endif
