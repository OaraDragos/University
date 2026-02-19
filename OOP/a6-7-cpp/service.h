#ifndef SERVICE_H
#define SERVICE_H

#include "repository.h"
#include <vector>
#include "user_repo.h"
class Service {
private:
    Repository repo;
    UserRepository* userRepo;

public:
    Service( Repository& r,UserRepository* ur) : repo( r ), userRepo( ur ) {}

    void add10();
    void addTrenchCoat(const std::string& size, const std::string& color, double price, int quantity, const std::string& photo);
    void removeTrenchCoat(const std::string& size, const std::string& color);
    void updateTrenchCoat(const std::string& size, const std::string& color, double price, int quantity);

    std::vector<TrenchCoat> listTrenchCoats() const;
    std::vector<TrenchCoat> getFilteredCoats(const std::string& size) const;

    void addToBasket(TrenchCoat& coat);
    std::vector<TrenchCoat> getBasket() const;
    double getTotalBasketPrice() const;
    void showBasket() const;

    TrenchCoat getTrenchCoatById(int id) const;
    TrenchCoat getTrenchCoatBySize(int& currentIndex, const std::string& size) const;
    void savedata() {

        repo.saveToFile();

    };
};

#endif
