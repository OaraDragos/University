cmake_minimum_required(VERSION 3.30)
project(untitled)

set(CMAKE_CXX_STANDARD 20)

add_executable(untitled main.cpp
        domain.cpp
        repository.cpp
        service.cpp
        ui.cpp
        user_repo.h
        user_repo_csv.h
        user_repo_html.h
        ui.h
        repository.h
        service.h
        domain.h


)
