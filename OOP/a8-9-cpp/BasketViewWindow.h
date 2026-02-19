#pragma once
#include <QWidget>
#include <QTableView>
#include <QVBoxLayout>
#include "baskettablemodel.h"

class BasketViewWindow : public QWidget {
    Q_OBJECT

public:
    BasketViewWindow(const std::vector<TrenchCoat>& basket, QWidget* parent = nullptr);
};
