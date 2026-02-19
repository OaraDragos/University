#ifndef DOMAIN_H
#define DOMAIN_H
#pragma once
#include <string>
#include <iostream>
#include <string>
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
    friend std::istream& operator>>(std::istream& in, TrenchCoat& coat) {
        in >> coat.size >> coat.color >> coat.price >> coat.quantity;
        in.ignore(); // Ignore trailing space/newline
        std::getline(in, coat.photo);
        return in;
    }

    friend std::ostream& operator<<(std::ostream& out, const TrenchCoat& coat) {
        out << coat.size << " " << coat.color << " " << coat.price << " " << coat.quantity << " " << coat.photo << "\n";
        return out;
    }
    std::string toString() const {
        return "Size: " + size + ", Color: " + color +
               ", Price: " + std::to_string(price) +
               ", Quantity: " + std::to_string(quantity) +
               ", Photo: " + photo;
    }

};
class TrenchCoatValidator {
public:
    static void validate(const TrenchCoat& coat);
};

#endif
#include <stdexcept>
#include <string>

class ValidationException : public std::runtime_error {
public:
    explicit ValidationException(const std::string& msg) : std::runtime_error(msg) {}
};
class RepositoryException : public std::runtime_error {
public:
    explicit RepositoryException(const std::string& msg) : std::runtime_error(msg) {}
};