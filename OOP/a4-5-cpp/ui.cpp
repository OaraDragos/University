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

                if (price < 0 || quantity < 0) {
                    std::cerr << "Error: Price and quantity must be non-negative.\n";
                    continue;
                }

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
/*
void UI::run_user() {
    service.add10();

    std::cout << "Available trench coats:\n";
    for (const auto& coat : service.listTrenchCoats()) {
        std::cout << coat.getID() << " ";
        coat.print();
    }

    int menuChoice;

    while (true) {
        std::cout << "\n===== Menu =====" << std::endl;
        std::cout << "1. Add to basket" << std::endl;
        std::cout << "2. Print basket" << std::endl;
        std::cout << "3. Total basket price" << std::endl;
        std::cout << "0. Exit" << std::endl;
        std::cout << "Choose an option: ";
        std::cin >> menuChoice;

        switch (menuChoice) {
            case 1: {
                try {
                    int coatID;
                    std::cout << "Please enter the ID of the trench coat you want to add to the basket: ";
                    std::cin >> coatID;
                    TrenchCoat aux = service.getTrenchCoatbyid(coatID - 1);
                    service.addToBasket(aux);
                    std::cout << "Added trench coat with ID " << coatID << " to basket.\n";
                } catch (const std::exception& e) {
                    std::cerr << "Exception: " << e.what() << std::endl;
                }
                break;
            }
            case 2: {
                std::cout << "Current basket contents:\n";
                for (const auto& coat : service.getBasket()) {
                    coat.print();
                }
                break;
            }
            case 3: {
                double total = service.getTotalBasketPrice();
                std::cout << "Total price: " << total << std::endl;
                break;
            }
            case 0:
                std::cout << "Exiting program." << std::endl;
            return;
            default:
                std::cout << "Invalid option. Try again." << std::endl;
        }
    }
}
*/
void UI::run_user() {
    try {
        // Only add 10 trench coats if repo is empty
        if (service.listTrenchCoats().getSize() == 0) {
            service.add10();
        }
    } catch (const std::exception& e) {
        std::cerr << "Warning: Could not preload coats: " << e.what() << "\n";
    }

    std::string size;
    int currentIndex = 0;

    std::cout << "Enter size to filter by (leave empty for all sizes): ";
    std::cin.ignore(); // Flush leftover newline
    std::getline(std::cin, size);

    TrenchCoat currentCoat;

    // Loop until we get a valid coat
    while (true) {
        try {
            currentCoat = service.getTrenchCoatBySize(currentIndex, size);
            break;
        } catch (const std::exception& e) {
            std::cerr << "Error: " << e.what() << "\n";
            std::cout << "Try a different size? (yes/no): ";
            std::string choice;
            std::getline(std::cin, choice);
            if (choice == "no") return;
            std::cout << "Enter size to filter by (leave empty for all sizes): ";
            std::getline(std::cin, size);
            currentIndex = 0;
        }
    }

    // Main interaction loop
    while (true) {
        try {
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
            std::cout << "0. Exit\n";
            std::cout << "Choose an option: ";
            std::cin >> menuChoice;

            if (std::cin.fail()) {
                std::cin.clear();
                std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
                std::cout << "Invalid input. Please enter a number.\n";
                continue;
            }

            switch (menuChoice) {
                case 1:
                    try {
                        service.addToBasket(currentCoat);
                        std::cout << "Trench coat added to basket.\n";
                    } catch (const std::exception& e) {
                        std::cerr << "Could not add coat: " << e.what() << "\n";
                    }
                    break;

                case 2:
                    try {
                        currentCoat = service.getTrenchCoatBySize(currentIndex, size);
                    } catch (const std::exception& e) {
                        std::cerr << "No more coats available in this size. Restarting from beginning...\n";
                        currentIndex = 0;
                        currentCoat = service.getTrenchCoatBySize(currentIndex, size);
                    }
                    break;

                case 3:
                    std::cout << "Your Basket:\n";
                    for (const auto& coat : service.getBasket()) {
                        coat.print();
                    }
                    break;

                case 4:
                    std::cout << "Total Price: " << service.getTotalBasketPrice() << "\n";
                    break;

                case 0:
                    std::cout << "Exiting.\n";
                    return;

                default:
                    std::cout << "Invalid option. Try again.\n";
            }

        } catch (const std::exception& e) {
            std::cerr << "Unexpected error: " << e.what() << "\n";
        }
    }
}
