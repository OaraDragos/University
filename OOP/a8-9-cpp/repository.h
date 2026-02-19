#ifndef REPOSITORY_H
#define REPOSITORY_H
#pragma once

#include "domain.h"
#include <vector>
#include <string>
#include <stdexcept>
#include "command.h"
#include "command_manager.h"
class Repository {
private:
    std::vector<TrenchCoat> coats;
    std::string fileName;

    void loadFromFile();

public:
    Repository(const std::string& fileName);

    void saveToFile();

    void addCoat(const TrenchCoat& coat);
    void remove(const std::string& size, const std::string& color);
    void update(const std::string& size, const std::string& color, double newPrice, int newQuantity);

    const TrenchCoat& findCoat(const std::string& size, const std::string& color) const;

    const std::vector<TrenchCoat>& getAll() const;
};

#endif
