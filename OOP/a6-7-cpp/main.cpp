#include "ui.h"
#include "service.h"
#include "repository.h"
#include "user_repo_csv.h"
#include "user_repo_html.h"

#include <iostream>
#include <memory>  // for std::unique_ptr

int main() {
    Repository repo("idk.txt");  // Admin repository

    std::unique_ptr<UserRepository> userRepo;
    std::string type;

    std::cout << "Select shopping basket format (csv/html): ";
    std::cin >> type;

    if (type == "csv") {
        userRepo = std::make_unique<UserRepoCSV>("basket.csv");
    } else if (type == "html") {
        userRepo = std::make_unique<UserRepoHTML>("basket.html");
    } else {
        std::cerr << "Invalid file type! Please enter 'csv' or 'html'.\n";
        return 1;
    }

    Service service{ repo, userRepo.get() };
    UI ui{ service };

    int cmd = 0;
    std::cout << "Enter 1 for Admin mode, 2 for User mode: ";
    std::cin >> cmd;

    switch (cmd) {
        case 1:
            std::cout << "Admin mode\n";
        ui.run_admin();
        break;
        case 2:
            std::cout << "User mode\n";
        ui.run_user();
        break;
        default:
            std::cerr << "Invalid command.\n";
        return 1;
    }

    return 0;
}
