#include "domain.h"
#include <windows.h>
#include <string>
#include <iostream>

TrenchCoat::TrenchCoat() : id(0) ,size(""), color(""), price(0), quantity(0), photo("") {}

TrenchCoat::TrenchCoat(int id,std::string size, std::string color, double price, int quantity, std::string photo)
    : id(id),size(size), color(color), price(price), quantity(quantity), photo(photo) {}

std::string TrenchCoat::getSize() const {
    return size;
}

std::string TrenchCoat::getColor() const {
    return color;
}

double TrenchCoat::getPrice() const {
    return price;
}

int TrenchCoat::getQuantity() const {
    return quantity;
}

std::string TrenchCoat::getPhoto() const {
    return photo;
}

void TrenchCoat::setPrice(double newPrice) {
    price = newPrice;
}

void TrenchCoat::setQuantity(int newQuantity) {
    quantity = newQuantity;
}

void TrenchCoat::print() const {
    std::cout << "Size: " << size << ", Color: " << color
              << ", Price: " << price << ", Quantity: " << quantity
              << ", Photo: " << photo << "\n";
#
    ShellExecuteA(NULL, "open", photo.c_str(), NULL, NULL, SW_SHOWNORMAL);
}
void TrenchCoatValidator::validate(const TrenchCoat& coat) {
    std::string errors;

    if (coat.getSize().empty()) {
        errors += "Size cannot be empty.\n";
    }
    if (coat.getColor().empty()) {
        errors += "Color cannot be empty.\n";
    }
    if (coat.getPrice() < 0) {
        errors += "Price must be positive.\n";
    }
    if (coat.getQuantity() < 0) {
        errors += "Quantity cannot be negative.\n";
    }
    if (coat.getPhoto().empty()) {
        errors += "Photo link cannot be empty.\n";
    }

    if (!errors.empty()) {
        throw ValidationException(errors);
    }
}