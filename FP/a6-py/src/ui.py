#
# This is the program's UI module. The user interface and all interaction with the user (print and input statements) are found here
#
from functions import *
menu_options = {
        1: ("Add a number", lambda numbers: ui_add(numbers)),
        2: ("Insert a number", lambda numbers: ui_insert(numbers)),
        3: ("Remove a number", lambda numbers: ui_remove(numbers)),
        4: ("Remove a range of numbers", lambda numbers: ui_remove_range(numbers)),
        5: ("Replace a number", lambda numbers: ui_replace(numbers)),
        6: ("List all numbers", lambda numbers: ui_list(numbers)),
        7: ("List real numbers", lambda numbers: ui_list_real(numbers)),
        8: ("List numbers by modulo criteria", lambda numbers: ui_list_modulo(numbers)),
        9: ("Exit", lambda numbers: exit_program())
    }

def display_menu():
    print("\nMenu:")
    for key, (description, _) in menu_options.items():
        print(f"{key}. {description}")

def main():
    numbers = initialize_numbers()
    print("Initial numbers:")
    print(list_numbers(numbers))

def exit_program():
    print("Exiting the program. Goodbye!")
    exit()
def ui_add(numbers):
    number = input("Enter the complex number (e.g., 4+2i): ")
    add_number(numbers, number)

def ui_insert(numbers):
    number = input("Enter the complex number (e.g., 4+2i): ")
    position = int(input("Enter the position: "))
    insert_number(numbers, number, position)

def ui_remove(numbers):
    position = int(input("Enter the position: "))
    remove_number(numbers, position)

def ui_remove_range(numbers):
    start = int(input("Enter the start position: "))
    end = int(input("Enter the end position: "))
    remove_range(numbers, start, end)

def ui_replace(numbers):
    old = input("Enter the old complex number (e.g., 4+2i): ")
    new = input("Enter the new complex number (e.g., 5-3i): ")
    replace_number(numbers, old, new)

def ui_list(numbers):
    print(list_numbers(numbers))

def ui_list_real(numbers):
    start = int(input("Enter the start position: "))
    end = int(input("Enter the end position: "))
    print(list_real(numbers, start, end))

def ui_list_modulo(numbers):
    operator = input("Enter the operator (<, =, >): ")
    value = float(input("Enter the value: "))
    print(list_modulo(numbers, operator, value))