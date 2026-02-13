from final import *
import pickle
import pickle

class Repository:
    """Abstract base class for repositories."""
    def save(self, entity):
        raise NotImplementedError("Save method not implemented.")

    def load_all(self):
        raise NotImplementedError("Load_all method not implemented.")

class MemoryRepository(Repository):
    """In-memory repository implementation."""
    def __init__(self):
        self._storage = []

    def save(self, entity):
        self._storage.append(entity)

    def load_all(self):
        return self._storage[:]

class TextFileRepository(Repository):
    """Text file repository implementation."""
    def __init__(self, file_path):
        self.file_path = file_path

    def save(self, entity):
        with open(self.file_path, 'a') as f:
            f.write(f"{entity.real},{entity.imag}\n")

    def load_all(self):
        entities = []
        try:
            with open(self.file_path, 'r') as f:
                for line in f:
                    real, imag = map(int, line.strip().split(','))
                    entities.append(ComplexNumber(real, imag))
        except FileNotFoundError:
            pass  # File doesn't exist yet
        return entities

class BinaryFileRepository(Repository):
    """Binary file repository implementation."""
    def __init__(self, file_path):
        self.file_path = file_path

    def save(self, entity):
        entities = self.load_all()
        entities.append(entity)
        with open(self.file_path, 'wb') as f:
            pickle.dump(entities, f)

    def load_all(self):
        try:
            with open(self.file_path, 'rb') as f:
                return pickle.load(f)
        except (FileNotFoundError, EOFError):
            return []

class ComplexNumber:
    def __init__(self, real, imag):
        self.real = real
        self.imag = imag

    def __str__(self):
        if self.imag >= 0:
            sign = '+'
        else:
            sign = '-'
        return f"{self.real} {sign} {abs(self.imag)}i"

class ComplexNumberList:
    def __init__(self, repository):
        self.repository = repository
        self.complex_number_list = repository.load_all()
        self.history = []  # Stack to store the history for undo operations

    def save_state(self):
        self.history.append(self.complex_number_list[:])

    def add_number(self, complex_number):
        self.save_state()
        self.complex_number_list.append(complex_number)
        self.repository.save(complex_number)

    def filter_list(self, start, end):
        self.save_state()
        self.complex_number_list = self.complex_number_list[start:end + 1]

    def undo(self):
        if self.history:
            self.complex_number_list = self.history.pop()
        else:
            print("No operations to undo.")

    def display_list(self):
        if not self.complex_number_list:
            print("The list is empty.")
        else:
            for i, num in enumerate(self.complex_number_list):
                print(f"{i}: {num}")

    def __str__(self):
        return '\n'.join(str(num) for num in self.complex_number_list)

def main():
    print("Choose a repository type:")
    print("1. Memory Repository")
    print("2. Text File Repository")
    print("3. Binary File Repository")
    choice = input("Enter your choice: ")

    if choice == '1':
        repository = MemoryRepository()
    elif choice == '2':
        file_path = input("Enter the text file path: ")
        repository = TextFileRepository(file_path)
    elif choice == '3':
        file_path = input("Enter the binary file path: ")
        repository = BinaryFileRepository(file_path)
    else:
        print("Invalid choice.")
        return

    complex_list = ComplexNumberList(repository)

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
