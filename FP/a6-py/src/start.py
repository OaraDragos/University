#
# This module is used to invoke the program's UI and start it. It should not contain a lot of code.
#
from ui import *
from functions import initialize_numbers


def main():

    numbers = initialize_numbers()
    print("Initial numbers:")
    print(list_numbers(numbers))

    while True:
        display_menu()
        try:
            choice = int(input("Choose an option: "))
            if choice in menu_options:
                menu_options[choice][1](numbers)  # Pass the numbers list to the function
            else:
                print("Invalid option. Try again.")
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()