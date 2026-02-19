#include "ui.h"
#include <iostream>
void testService();
int main() {
    testService();
    DynamicVector<TrenchCoat> events{1};
    DynamicRepository repo{ events };
    Service service{ repo,repo };
    UI ui{ service };
    int cmd=0;
    std::cin>>cmd;
    if (1== cmd) {
        std::cout << "Admin mode\n";
        ui.run_admin();
    } else if (2 == cmd) {
        std::cout << "User mode\n";
        ui.run_user();
    } else {
        std::cout << "Invalid command\n";
        return 1;
    }

    return 0;
}
