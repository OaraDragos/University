from SERVICES import *
from repository_1 import *
def main():
    complex_list = ComplexNumberList()
    memory_repo = MemoryRepository()
    text_repo = TextFileRepository("complex_numbers.txt")
    binary_repo = BinaryFileRepository("complex_numbers.bin")
    def add_complex_number():
        try:
            real = int(input("Enter the real part: "))
            imag = int(input("Enter the imaginary part: "))
            complex_list.add_number(ComplexNumber(real, imag))
            print("Complex number added successfully.")
        except ValueError:
            print("Invalid input. Please enter integers for the real and imaginary parts.")

    def display_list():
        complex_list.display_list()

    def filter_list():
        try:
            start = int(input("Enter the start index: "))
            end = int(input("Enter the end index: "))
            complex_list.filter_list(start, end)
            print("List filtered successfully.")
        except (ValueError, IndexError):
            print("Invalid indices. Please enter valid integers within the list range.")

    def undo_operation():
        complex_list.undo()
        print("Undo completed.")

    def exit_program():
        print("Exiting program.")
        exit()

    menu_actions = {
        '1': add_complex_number,
        '2': display_list,
        '3': filter_list,
        '4': undo_operation,
        '5': exit_program
    }

    while True:
        print("\nMenu:")
        print("1. Add a complex number")
        print("2. Display the list of numbers")
        print("3. Filter the list (by indices)")
        print("4. Undo the last operation")
        print("5. Exit")

        choice = input("Enter your choice: ")
        action = menu_actions.get(choice)
        if action:
            action()
        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()