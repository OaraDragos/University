#include "basketviewwindow.h"

BasketViewWindow::BasketViewWindow(const std::vector<TrenchCoat>& basket, QWidget* parent)
    : QWidget(parent) {
    auto* layout = new QVBoxLayout(this);
    auto* tableView = new QTableView(this);
    auto* model = new BasketTableModel(basket, this);

    tableView->setModel(model);
    tableView->resizeColumnsToContents();
    layout->addWidget(tableView);

    setLayout(layout);
    setWindowTitle("Basket Table View");
    resize(700, 400);
}
