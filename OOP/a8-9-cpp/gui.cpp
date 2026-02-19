#include "gui.h"
#include <QVBoxLayout>
#include <QFormLayout>
#include <QMessageBox>
#include <QDesktopServices>
#include <QUrl>
#include <QShortcut>
Gui::Gui(Service& service, QWidget* parent)
        : QWidget(parent), service(service), currentIndex(0) {
    setupUI();
    connectSignalsAndSlots();
}

Gui::~Gui() {}

void Gui::setupUI() {
    auto* layout = new QVBoxLayout(this);

    auto* formLayout = new QFormLayout;
    sizeInput = new QLineEdit;
    colorInput = new QLineEdit;
    priceInput = new QLineEdit;
    quantityInput = new QLineEdit;
    photoInput = new QLineEdit;

    formLayout->addRow("Size:", sizeInput);
    formLayout->addRow("Color:", colorInput);
    formLayout->addRow("Price:", priceInput);
    formLayout->addRow("Quantity:", quantityInput);
    formLayout->addRow("Photo:", photoInput);

    layout->addLayout(formLayout);

    addButton = new QPushButton("Add Trench Coat");
    removeButton = new QPushButton("Remove Trench Coat");
    updateButton = new QPushButton("Update Trench Coat");
    showAllButton = new QPushButton("Show All");
    undoButton = new QPushButton("Undo");     // ✅ new
    redoButton = new QPushButton("Redo");     //  new

    layout->addWidget(addButton);
    layout->addWidget(removeButton);
    layout->addWidget(updateButton);
    layout->addWidget(showAllButton);
    layout->addWidget(undoButton);            //  new
    layout->addWidget(redoButton);            //  new

    coatList = new QListWidget;
    layout->addWidget(coatList);

    //  Keyboard shortcuts
    QShortcut* undoShortcut = new QShortcut(QKeySequence(Qt::CTRL + Qt::Key_Z), this);
    QShortcut* redoShortcut = new QShortcut(QKeySequence(Qt::CTRL + Qt::Key_Y), this);

    // Connect buttons and shortcuts to service methods
    connect(undoButton, &QPushButton::clicked, this, [this]() {
        service.undo();
        refreshCoatList(); // optional refresh
    });
    connect(redoButton, &QPushButton::clicked, this, [this]() {
        service.redo();
        refreshCoatList(); // optional refresh
    });
    connect(undoShortcut, &QShortcut::activated, this, [this]() {
        service.undo();
        refreshCoatList();
    });
    connect(redoShortcut, &QShortcut::activated, this, [this]() {
        service.redo();
        refreshCoatList();
    });
}
void Gui::refreshCoatList() {
    coatList->clear();
    for (const auto& coat : service.listTrenchCoats()) {
        coatList->addItem(QString::fromStdString(coat.toString()));
    }
}

void Gui::connectSignalsAndSlots() {
    connect(addButton, &QPushButton::clicked, this, &Gui::onAddTrenchCoat);
    connect(removeButton, &QPushButton::clicked, this, &Gui::onRemoveTrenchCoat);
    connect(updateButton, &QPushButton::clicked, this, &Gui::onUpdateTrenchCoat);
    connect(showAllButton, &QPushButton::clicked, this, &Gui::onShowAll);

}

void Gui::onAddTrenchCoat() {
    try {
        service.addTrenchCoat(sizeInput->text().toStdString(), colorInput->text().toStdString(),
                              priceInput->text().toDouble(), quantityInput->text().toInt(),
                              photoInput->text().toStdString());
        QMessageBox::information(this, "Success", "Coat added.");
    } catch (std::exception& e) {
        QMessageBox::warning(this, "Error", e.what());
    }
}

void Gui::onRemoveTrenchCoat() {
    try {
        service.removeTrenchCoat(sizeInput->text().toStdString(), colorInput->text().toStdString());
        QMessageBox::information(this, "Success", "Coat removed.");
    } catch (std::exception& e) {
        QMessageBox::warning(this, "Error", e.what());
    }
}

void Gui::onUpdateTrenchCoat() {
    try {
        service.updateTrenchCoat(sizeInput->text().toStdString(), colorInput->text().toStdString(),
                                 priceInput->text().toDouble(), quantityInput->text().toInt());
        QMessageBox::information(this, "Success", "Coat updated.");
    } catch (std::exception& e) {
        QMessageBox::warning(this, "Error", e.what());
    }
}

void Gui::onShowAll() {
    coatList->clear();
    for (const auto& coat : service.listTrenchCoats()) {
        coatList->addItem(QString::fromStdString(coat.toString()));
    }
}
//choser
Chooser::Chooser(Service& service, QWidget* parent)
    : QWidget(parent), service(service) {
    setWindowTitle("Select Mode");
    resize(200, 150);

    adminButton = new QPushButton("Admin Mode");
    userButton = new QPushButton("User Mode");
    exitButton = new QPushButton("Exit");

    QVBoxLayout* layout = new QVBoxLayout(this);
    layout->addWidget(adminButton);
    layout->addWidget(userButton);
    layout->addWidget(exitButton);
    setLayout(layout);

    connect(adminButton, &QPushButton::clicked, this, &Chooser::openAdmin);
    connect(userButton, &QPushButton::clicked, this, &Chooser::openUser);
    connect(exitButton, &QPushButton::clicked, this, &QWidget::close);
}

void Chooser::openAdmin() {
    auto* adminWin = new Gui(service);
    adminWin->show();
}

void Chooser::openUser() {
    auto* userWin = new UserModeWindow(service);
    userWin->show();
}
//basket selector


BasketSelector::BasketSelector(QWidget* parent)
    : QWidget(parent) {
    setWindowTitle("Select Basket Type");
    resize(250, 100);

    csvButton = new QPushButton("Use CSV Basket");
    htmlButton = new QPushButton("Use HTML Basket");

    auto* layout = new QVBoxLayout(this);
    layout->addWidget(csvButton);
    layout->addWidget(htmlButton);
    setLayout(layout);

    connect(csvButton, &QPushButton::clicked, this, &BasketSelector::chooseCSV);
    connect(htmlButton, &QPushButton::clicked, this, &BasketSelector::chooseHTML);
}

void BasketSelector::chooseCSV() {
    auto* repo = new Repository("../trenchcoats.txt");
    auto* userRepo = new UserRepoCSV("../basket.csv");
    auto* service = new Service(*repo, userRepo);

    auto* chooser = new Chooser(*service);
    chooser->show();
    this->close();
}

void BasketSelector::chooseHTML() {
    auto* repo = new Repository("../trenchcoats.txt");
    auto* userRepo = new UserRepoHTML("../basket.html");
    auto* service = new Service(*repo, userRepo);

    auto* chooser = new Chooser(*service);
    chooser->show();
    this->close();
}

