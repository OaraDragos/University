#include <QApplication>

#include "service.h"
#include "repository.h"
#include "user_repo_csv.h"
#include <QApplication>
#include "gui.h"
#include "usermodewindow.h"
int main(int argc, char* argv[]) {
    QApplication a(argc, argv);

    Repository repo("../trenchcoats.txt");
    UserRepoCSV userRepo("../basket.txt");
    Service service(repo, &userRepo);

    Gui adminWindow(service);
    UserModeWindow userWindow(service);

    BasketSelector selector;
    selector.show();

    return a.exec();
}

