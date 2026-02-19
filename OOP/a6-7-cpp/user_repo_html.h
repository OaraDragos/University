//
// Created by oarad on 5/15/2025.
//

#ifndef USER_REPO_HTML_H
#define USER_REPO_HTML_H
#pragma once
#include "user_repo.h"
#include <fstream>
#include <cstdlib>

class UserRepoHTML : public UserRepository {
private:
    std::vector<TrenchCoat> basket;
    std::string fileName;
public:
    UserRepoHTML(const std::string& fileName) : fileName(fileName) {}

    void addCoat(const TrenchCoat& coat) override {
        basket.push_back(coat);
        saveToFile();
    }

    void saveToFile() const override {
        std::ofstream out(fileName);
        out << "<!DOCTYPE html>\n<html>\n<head>\n<title>Shopping Basket</title>\n</head>\n<body>\n";
        out << "<table border=\"1\">\n<tr><td>Size</td><td>Color</td><td>Price</td><td>Quantity</td><td>Photo</td></tr>\n";

        for (const auto& c : basket) {
            out << "<tr><td>" << c.getSize() << "</td><td>" << c.getColor() << "</td><td>" << c.getPrice()
                << "</td><td>" << c.getQuantity() << "</td><td><a href=\"" << c.getPhoto() << "\">Link</a></td></tr>\n";
        }

        out << "</table>\n</body>\n</html>";
    }

    void openFile() const override {
        std::string command = "start \"\" \"" + fileName + "\"";
        system(command.c_str());
    }

    const std::vector<TrenchCoat>& getAll() const override {
        return basket;
    }
};
#endif //USER_REPO_HTML_H
