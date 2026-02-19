#pragma once
#include <QWidget>
#include <QPushButton>
#include <QLabel>
#include <QLineEdit>
#include <QVBoxLayout>
#include <QTextEdit>
#include <QString>
#include "Service.h"
#include "BasketWindow.h"
#include "baskettablemodel.h"
class UserModeWindow : public QWidget {
    Q_OBJECT

public:
    UserModeWindow(Service& service, QWidget* parent = nullptr);

    private slots:
        void onFilter();
    void onAddToBasket();
    void onNextCoat();
    void onViewBasket();
    void onTotalPrice();
    void onOpenBasket();

private:
    Service& service;
    QString currentSizeFilter;
    int currentIndex;
    TrenchCoat currentCoat;

    QLineEdit* sizeInput;
    QLabel* coatInfo;
    QPushButton* addButton;
    QPushButton* nextButton;
    QPushButton* viewButton;
    QPushButton* totalButton;
    QPushButton* openButton;
    QPushButton* filterButton;

    void updateCoatDisplay();
};
