cmake_minimum_required(VERSION 3.16)
project(untitled99)

set(CMAKE_CXX_STANDARD 20)

# Find Qt6 components
find_package(Qt6 REQUIRED COMPONENTS Core Gui Widgets)

# Enable automatic MOC, UIC, and RCC
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTORCC ON)

# Add your executable
add_executable(untitled99
        main.cpp
        domain.cpp
        repository.cpp
        service.cpp
        ui.cpp
        gui.cpp
        gui.h
        domain.h
        repository.h
        service.h
        ui.h
        user_repo.h
        user_repo_csv.h
        user_repo_html.h
        usermodewindow.cpp
        usermodewindow.h
        command_manager.h
        concrete_commands.h
        baskettablemodel.h
        BasketWindow.h
        BasketWindow.cpp
        baskettablemodel.cpp
        command.h
        command.cpp
        BasketWindow.cpp
        BasketWindow.h
        BasketViewWindow.cpp
        BasketViewWindow.h
)

# Link Qt6 libraries
target_link_libraries(untitled99
        Qt6::Core
        Qt6::Gui
        Qt6::Widgets
)
