#ifndef SERVICE_H
#define SERVICE_H
#include "repository.h"

class Service {
private:
    DynamicRepository repo;
    DynamicRepository userRepo;


public:
    Service(const DynamicRepository& repo, const DynamicRepository& userRepo) : repo{ repo }, userRepo{ userRepo } {}

    void add10();
    void addTrenchCoat(const std::string& size, const std::string& color, double price, int quantity, const std::string& photo);
    void removeTrenchCoat(const std::string& size, const std::string& color);
    void updateTrenchCoat(const std::string& size, const std::string& color, double price, int quantity);
    DynamicVector<TrenchCoat> listTrenchCoats() const;
    DynamicVector<TrenchCoat> getFilteredCoats(const std::string& size) const;
    void addToBasket(TrenchCoat& coat);
    DynamicVector<TrenchCoat> getBasket() const;
    double getTotalBasketPrice() const;
    void empty();
    TrenchCoat getTrenchCoatbyid(int id) const;
    TrenchCoat getTrenchCoatBySize(int& currentIndex, const std::string& size)const;
};

#endif