#include "baskettablemodel.h"

BasketTableModel::BasketTableModel(const std::vector<TrenchCoat>& data, QObject* parent)
    : QAbstractTableModel(parent), basket(data) {}

int BasketTableModel::rowCount(const QModelIndex&) const {
    return static_cast<int>(basket.size());
}

int BasketTableModel::columnCount(const QModelIndex&) const {
    return 5; // size, color, price, quantity, photo
}

QVariant BasketTableModel::data(const QModelIndex& index, int role) const {
    if (!index.isValid() || role != Qt::DisplayRole)
        return QVariant();

    const TrenchCoat& coat = basket[index.row()];
    switch (index.column()) {
        case 0: return QString::fromStdString(coat.getSize());
        case 1: return QString::fromStdString(coat.getColor());
        case 2: return coat.getPrice();
        case 3: return coat.getQuantity();
        case 4: return QString::fromStdString(coat.getPhoto());
        default: return QVariant();
    }
}

QVariant BasketTableModel::headerData(int section, Qt::Orientation orientation, int role) const {
    if (role != Qt::DisplayRole) return QVariant();

    if (orientation == Qt::Horizontal) {
        switch (section) {
            case 0: return "Size";
            case 1: return "Color";
            case 2: return "Price";
            case 3: return "Quantity";
            case 4: return "Photo";
        }
    }
    return QVariant();
}
