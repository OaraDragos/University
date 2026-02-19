//
// Created by oarad on 5/15/2025.
//

#ifndef USER_REPO_H
#define USER_REPO_H



#pragma once
#include <vector>
#include "domain.h"

class UserRepository {
public:
    virtual void addCoat(const TrenchCoat& coat) = 0;
    virtual void saveToFile() const = 0;
    virtual void openFile() const = 0;
    virtual const std::vector<TrenchCoat>& getAll() const = 0;
    virtual ~UserRepository() = default;
};


#endif //USER_REPO_H
