#include "ui.h"
#include <iostream>
#include <limits>

void UI::run_admin() {
    int option;
    do {
        std::cout << "1. Add Trench Coat\n2. Remove Trench Coat\n3. Update Trench Coat\n4. Show All\n0. Exit\nChoose: ";
        std::cin >> option;

        if (std::cin.fail()) {
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cerr << "Invalid input. Please enter a number.\n";
            continue;
        }

        try {
            if (option == 1) {
                std::string size, color, photo;
                double price;
                int quantity;

                std::cout << "Enter size: ";
                std::cin >> size;
                std::cout << "Enter color: ";
                std::cin >> color;
                std::cout << "Enter price: ";
                std::cin >> price;
                std::cout << "Enter quantity: ";
                std::cin >> quantity;
                std::cout << "Enter photo URL: ";
                std::cin >> photo;

                service.addTrenchCoat(size, color, price, quantity, photo);
                std::cout << "Trench coat added successfully.\n";

            } else if (option == 2) {
                std::string size, color;
                std::cout << "Enter size and color: ";
                std::cin >> size >> color;
                service.removeTrenchCoat(size, color);
                std::cout << "Trench coat removed successfully.\n";

            } else if (option == 3) {
                std::string size, color;
                double price;
                int quantity;

                std::cout << "Enter size, color, new price, new quantity: ";
                std::cin >> size >> color >> price >> quantity;

                service.updateTrenchCoat(size, color, price, quantity);
                std::cout << "Trench coat updated successfully.\n";

            } else if (option == 4) {
                for (const auto& coat : service.listTrenchCoats()) {
                    coat.print();
                }

            } else if (option != 0) {
                std::cerr << "Invalid option. Try again.\n";
            }

        } catch (const std::exception& e) {
            std::cerr << "Exception: " << e.what() << std::endl;
        }

    } while (option != 0);
}
void UI::run_user() {
    int currentIndex = 0;
    std::string size;
    TrenchCoat currentCoat;

    while (true) {
        std::cout << "Enter size to filter by (leave empty for all sizes): ";
        std::cin.ignore();
        std::getline(std::cin, size);

        try {
            currentCoat = service.getTrenchCoatBySize(currentIndex, size);
            break;
        } catch (const std::exception& e) {
            std::cerr << "Error: " << e.what() << "\nPlease try again.\n";
        }
    }

    while (true) {
        std::cout << "\nTrench Coat Details:\n";
        std::cout << "Size: " << currentCoat.getSize() << "\n";
        std::cout << "Color: " << currentCoat.getColor() << "\n";
        std::cout << "Price: " << currentCoat.getPrice() << "\n";
        std::cout << "Quantity: " << currentCoat.getQuantity() << "\n";
        std::cout << "Photo: " << currentCoat.getPhoto() << "\n";

        int menuChoice;
        std::cout << "\n===== Menu =====\n";
        std::cout << "1. Add to basket\n";
        std::cout << "2. Skip to next coat\n";
        std::cout << "3. View basket\n";
        std::cout << "4. View total price\n";
        std::cout << "5. Open basket file\n";
        std::cout << "0. Exit\n";
        std::cout << "Choose an option: ";
        std::cin >> menuChoice;

        if (std::cin.fail()) {
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "Invalid input. Please enter a valid option.\n";
            continue;
        }

        switch (menuChoice) {
            case 1:
                try {
                    service.addToBasket(currentCoat);
                    std::cout << "Added trench coat to basket.\n";
                } catch (const std::exception& e) {
                    std::cerr << "Error adding to basket: " << e.what() << std::endl;
                }
                break;

            case 2:
                try {
                    currentIndex++;
                    currentCoat = service.getTrenchCoatBySize(currentIndex, size);
                } catch (const std::exception& e) {
                    std::cerr << "Error: " << e.what() << "\nReturning to size selection.\n";
                    currentIndex = 0;
                    while (true) {
                        std::cout << "Enter size to filter by (leave empty for all sizes): ";
                        std::cin.ignore();
                        std::getline(std::cin, size);
                        try {
                            currentCoat = service.getTrenchCoatBySize(currentIndex, size);
                            break;
                        } catch (const std::exception& e) {
                            std::cerr << "Error: " << e.what() << "\nPlease try again.\n";
                        }
                    }
                }
                break;

            case 3:
                std::cout << "Current basket contents:\n";
                for (const auto& coat : service.getBasket())
                    coat.print();
                break;

            case 4:
                std::cout << "Total price: " << service.getTotalBasketPrice() << "\n";
                break;

            case 5:
                service.showBasket();
                break;

            case 0:
                std::cout << "Exiting program.\n";
                return;

            default:
                std::cout << "Invalid option. Try again.\n";
        }
    }
}
