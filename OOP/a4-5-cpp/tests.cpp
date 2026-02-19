#include <cassert>
#include <iostream>
#include "service.h"  // Include your service header here

void testService() {
    DynamicVector<TrenchCoat> events{1};
    DynamicRepository repo{ events };
    Service service{ repo,repo };

    // Test add10() populates repo with 10 trench coats
    service.add10();
    assert(service.listTrenchCoats().getSize() == 10);

    // Test addTrenchCoat() adds one more trench coat
    service.addTrenchCoat("XXL", "Orange", 200.0, 4, "orange.jpg");
    assert(service.listTrenchCoats().getSize() == 11);

    // Test invalid addTrenchCoat() with negative price
    service.addTrenchCoat("M", "Black", -10.0, 5, "bad.jpg");
    assert(service.listTrenchCoats().getSize() == 11); // Size should remain unchanged

    // Test removeTrenchCoat()
    service.removeTrenchCoat("M", "Black");
    assert(service.listTrenchCoats().getSize() == 10);

    // Test updateTrenchCoat() with valid input
    service.updateTrenchCoat("L", "Red", 99.99, 15);

    // Check if update was successful
    DynamicVector<TrenchCoat> coats = service.listTrenchCoats();
    for (int i = 0; i < coats.getSize(); ++i) {
        TrenchCoat c = coats.getElems()[i];
        if (c.getSize() == "L" && c.getColor() == "Red") {
            assert(c.getPrice() == 99.99);
            assert(c.getQuantity() == 15);
        }
    }

    // Test updateTrenchCoat() with negative input
    service.updateTrenchCoat("L", "Red", -100, -1);  // Should not update

    // Test getTrenchCoatbyid()
    TrenchCoat coat = service.getTrenchCoatbyid(0);
    assert(coat.getSize() == "L" || coat.getSize() == "S" || coat.getSize() == "M"); // Just to be safe

    // Test addToBasket() and getBasket()
    service.addToBasket(coat);
    DynamicVector<TrenchCoat> basket = service.getBasket();
    assert(basket.getSize() == 1);
    assert(basket.getElems()[0].getID() == 1);

    // Test getTotalBasketPrice()
    double total = service.getTotalBasketPrice();
    assert(total == coat.getPrice());

    // Test getTrenchCoatBySize()
    int currentIndex = 0;
    TrenchCoat sizeFilteredCoat = service.getTrenchCoatBySize(currentIndex, "M");
    assert(sizeFilteredCoat.getSize() == "M");

    // Test exception on invalid getTrenchCoatbyid
    try {
        service.getTrenchCoatbyid(100); // Out of bounds
        assert(false); // Should not reach here
    } catch (const std::out_of_range&) {
        assert(true);
    }

    // Test exception on getTrenchCoatBySize when no match
    try {
        int index = 0;
        service.getTrenchCoatBySize(index, "NON_EXISTENT_SIZE");
        assert(false);
    } catch (const std::out_of_range&) {
        assert(true);
    }

    std::cout << "All Service tests passed successfully!\n";
}
