#include "basketwindow.h"
#include <QHeaderView>

BasketWindow::BasketWindow(Service& service, QWidget* parent)
    : QWidget(parent) {
    setWindowTitle("Basket Contents");
    resize(600, 400);

    // Correctly pass data to the constructor
    model = new BasketTableModel(service.getBasket(), this);

    tableView = new QTableView(this);
    tableView->setModel(model);
    tableView->horizontalHeader()->setStretchLastSection(true);

    auto* layout = new QVBoxLayout(this);
    layout->addWidget(tableView);
    setLayout(layout);
}
