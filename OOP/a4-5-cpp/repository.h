#ifndef REPOSITORY_H
#define REPOSITORY_H
#pragma once
#include "domain.h"
#include "DynamicVector.h"

class DynamicRepository {
private:
    DynamicVector<TrenchCoat> coats;

public:
    DynamicRepository(const DynamicVector<TrenchCoat>& e) : coats(e) {}
    void addcoat(const TrenchCoat& coat);
    void remove(const std::string& size, const std::string& color);
    void update(const std::string& size, const std::string& color, double newPrice, int newQuantity);
    const DynamicVector<TrenchCoat>& getAll() const;
};
#endif