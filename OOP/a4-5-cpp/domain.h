#ifndef DOMAIN_H
#define DOMAIN_H
#pragma once
#include <string>
#include <iostream>

class TrenchCoat {
private:
    int id;
    std::string size;
    std::string color;
    double price;
    int quantity;
    std::string photo;

public:
    TrenchCoat();
    TrenchCoat(int id,std::string size, std::string color, double price, int quantity, std::string photo);

    int getID() const {
        return id;
    }
    std::string getSize() const;
    std::string getColor() const;
    double getPrice() const;
    int getQuantity() const;
    std::string getPhoto() const;

    void setPrice(double newPrice);
    void setQuantity(int newQuantity);
    void setID(int id) {
        this->id = id;
    }
    void print() const;
};
#endif