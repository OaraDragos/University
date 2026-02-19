#pragma once
#include <QWidget>
#include <QPushButton>
#include <QLineEdit>
#include <QListWidget>
#include "service.h"
#include "usermodewindow.h"
class Gui : public QWidget {
    Q_OBJECT

public:
    explicit Gui(Service& service, QWidget* parent = nullptr);
    ~Gui();

private:
    Service& service;
    int currentIndex;

    QLineEdit* sizeInput;
    QLineEdit* colorInput;
    QLineEdit* priceInput;
    QLineEdit* quantityInput;
    QLineEdit* photoInput;

    QPushButton* addButton;
    QPushButton* removeButton;
    QPushButton* updateButton;
    QPushButton* showAllButton;
    QPushButton* undoButton;
    QPushButton* redoButton;

    QListWidget* coatList;

    void setupUI();
    void connectSignalsAndSlots();
    void refreshCoatList();

    private slots:
        void onAddTrenchCoat();
    void onRemoveTrenchCoat();
    void onUpdateTrenchCoat();
    void onShowAll();

};
#pragma once

#include <QWidget>
#include <QPushButton>
#include <QVBoxLayout>
#include "service.h"

class Chooser : public QWidget {
    Q_OBJECT

public:
    explicit Chooser(Service& service, QWidget* parent = nullptr);

private:
    Service& service;
    QPushButton* adminButton;
    QPushButton* userButton;
    QPushButton* exitButton;

    private slots:
        void openAdmin();
    void openUser();
};
#pragma once

#include <QWidget>
#include <QPushButton>
#include <QVBoxLayout>

#include "repository.h"
#include "service.h"
#include "user_repo_csv.h"
#include "user_repo_html.h"

class BasketSelector : public QWidget {
    Q_OBJECT

public:
    explicit BasketSelector(QWidget* parent = nullptr);

private:
    QPushButton* csvButton;
    QPushButton* htmlButton;

    private slots:
        void chooseCSV();
    void chooseHTML();
};


