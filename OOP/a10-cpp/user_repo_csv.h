//
// Created by oarad on 5/15/2025.
//

#ifndef USER_REPO_CSV_H
#define USER_REPO_CSV_H
#pragma once
#include "user_repo.h"
#include <fstream>
#include <cstdlib>

class UserRepoCSV : public UserRepository {
private:
    std::vector<TrenchCoat> basket;
    std::string fileName;
public:
    UserRepoCSV(const std::string& fileName) : fileName(fileName) {}

    void addCoat(const TrenchCoat& coat) override {
        basket.push_back(coat);
        saveToFile();
    }

    void saveToFile() const override {
        std::ofstream out(fileName);
        for (const auto& c : basket) {
            out << c.getSize() << "," << c.getColor() << "," << c.getPrice() << ","
                << c.getQuantity() << "," << c.getPhoto() << "\n";
        }
    }

    void openFile() const override {
        std::string command = "notepad \"" + fileName + "\"";
        system(command.c_str());
    }

    const std::vector<TrenchCoat>& getAll() const override {
        return basket;
    }
    void clear_file() override {
        std::ofstream out(fileName, std::ios::trunc);
        out.close();
    }
};

#endif //USER_REPO_CSV_H
