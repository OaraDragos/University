#include "usermodewindow.h"
#include <QMessageBox>
#include <QDesktopServices>
#include <QUrl>
#include "basketviewwindow.h"
UserModeWindow::UserModeWindow(Service& service, QWidget* parent)
    : QWidget(parent), service(service), currentIndex(0) {
    service.clear_file();

    sizeInput = new QLineEdit(this);
    filterButton = new QPushButton("Filter by size", this);
    coatInfo = new QLabel("Coat details will appear here", this);

    addButton = new QPushButton("Add to Basket", this);
    nextButton = new QPushButton("Next Coat", this);
    viewButton = new QPushButton("View Basket", this);
    totalButton = new QPushButton("Total Price", this);
    openButton = new QPushButton("Open Basket File", this);

    QVBoxLayout* layout = new QVBoxLayout();
    layout->addWidget(sizeInput);
    layout->addWidget(filterButton);
    layout->addWidget(coatInfo);
    layout->addWidget(addButton);
    layout->addWidget(nextButton);
    layout->addWidget(viewButton);
    layout->addWidget(totalButton);
    layout->addWidget(openButton);

    setLayout(layout);

    connect(filterButton, &QPushButton::clicked, this, &UserModeWindow::onFilter);
    connect(addButton, &QPushButton::clicked, this, &UserModeWindow::onAddToBasket);
    connect(nextButton, &QPushButton::clicked, this, &UserModeWindow::onNextCoat);
    connect(viewButton, &QPushButton::clicked, this, &UserModeWindow::onViewBasket);
    connect(totalButton, &QPushButton::clicked, this, &UserModeWindow::onTotalPrice);
    connect(openButton, &QPushButton::clicked, this, &UserModeWindow::onOpenBasket);
}

void UserModeWindow::onFilter() {
    currentSizeFilter = sizeInput->text();
    currentIndex = 0;

    try {
        currentCoat = service.getTrenchCoatBySize(currentIndex, currentSizeFilter.toStdString());
        updateCoatDisplay();
    } catch (const std::exception& e) {
        QMessageBox::warning(this, "Error", e.what());
    }
}

void UserModeWindow::onAddToBasket() {
    try {
        service.addToBasket(currentCoat);
        QMessageBox::information(this, "Success", "Added to basket.txt.");
    } catch (const std::exception& e) {
        QMessageBox::warning(this, "Error", e.what());
    }
}

void UserModeWindow::onNextCoat() {
    try {
        currentIndex++;
        currentCoat = service.getTrenchCoatBySize(currentIndex, currentSizeFilter.toStdString());
        updateCoatDisplay();
    } catch (const std::exception& e) {
        QMessageBox::warning(this, "No More Coats", e.what());
        currentIndex = 0;
    }
}
void UserModeWindow::onViewBasket() {
    auto* viewWindow = new BasketViewWindow(service.getBasket(), this);
    viewWindow->show();
}

void UserModeWindow::onTotalPrice() {
    double total = service.getTotalBasketPrice();
    QMessageBox::information(this, "Total Price", "Total: " + QString::number(total));
}

void UserModeWindow::onOpenBasket() {
    service.showBasket();
}

void UserModeWindow::updateCoatDisplay() {
    QString text = "Size: " + QString::fromStdString(currentCoat.getSize()) + "\n";
    text += "Color: " + QString::fromStdString(currentCoat.getColor()) + "\n";
    text += "Price: " + QString::number(currentCoat.getPrice()) + "\n";
    text += "Quantity: " + QString::number(currentCoat.getQuantity()) + "\n";
    text += "Photo: " + QString::fromStdString(currentCoat.getPhoto()) + "\n";

    coatInfo->setText(text);
}
