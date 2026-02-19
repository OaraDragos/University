#ifndef BASKETWINDOW_H
#define BASKETWINDOW_H

#include <QWidget>
#include <QTableView>
#include <QVBoxLayout>
#include "baskettablemodel.h"
#include "service.h"

class BasketWindow : public QWidget {
    Q_OBJECT

private:
    QTableView* tableView;
    BasketTableModel* model;

public:
    explicit BasketWindow(Service& service, QWidget* parent = nullptr);
};

#endif
