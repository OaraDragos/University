#ifndef UI_H
#define UI_H
#include "service.h"

class UI {
private:
    Service service;

public:
    UI(const Service& service) : service{ service } {}
    void run_admin();
    void run_user();
};
#endif