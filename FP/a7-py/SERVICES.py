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
    def __init__(self):
        self.complex_number_list = []
        self.history = []  # Stack to store the history for undo operations

    def save_state(self):
        # Save a deep copy of the current list to the history for undo purposes
        self.history.append(self.complex_number_list[:])

    def add_number(self, complex_number):
        self.save_state()
        self.complex_number_list.append(complex_number)

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

