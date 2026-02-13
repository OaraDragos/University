#
# The program's functions are implemented here. There is no user interaction in this file, therefore no input/print statements. Functions here
# communicate via function parameters, the return statement and raising of exceptions. 
#
import cmath
import random
from texttable import Texttable

# Exception classes
class InvalidCommand(Exception):
    pass

class InvalidIndex(Exception):
    pass

class InvalidComplexNumber(Exception):
    pass

# Helper Functions
def parse_complex(number: str) -> complex:
    """Parses a string into a complex number."""
    try:
        return complex(number.replace("i", "j"))
    except ValueError:
        raise InvalidComplexNumber(f"Invalid complex number format: {number}")

# (A) Add and Insert
def add_number(numbers: list[complex], number: str) -> None:
    """Adds a complex number to the list."""
    numbers.append(parse_complex(number))

def insert_number(numbers: list[complex], number: str, position: int) -> None:
    """Inserts a complex number at the specified position."""
    if position < 0 or position > len(numbers):
        raise InvalidIndex("Position out of range.")
    numbers.insert(position, parse_complex(number))

# (B) Modify
def remove_number(numbers: list[complex], position: int) -> None:
    """Removes the number at a specific position."""
    if position < 0 or position >= len(numbers):
        raise InvalidIndex("Position out of range.")
    del numbers[position]

def remove_range(numbers: list[complex], start: int, end: int) -> None:
    """Removes numbers from start to end positions."""
    if start < 0 or end >= len(numbers) or start > end:
        raise InvalidIndex("Invalid range.")
    del numbers[start:end + 1]

def replace_number(numbers: list[complex], old_number: str, new_number: str) -> None:
    """Replaces all occurrences of old_number with new_number."""
    old = parse_complex(old_number)
    new = parse_complex(new_number)
    for i in range(len(numbers)):
        if numbers[i] == old:
            numbers[i] = new

# (C) Display
def list_numbers(numbers: list[complex]) -> str:
    """Displays all numbers."""
    table = Texttable()
    table.header(["Index", "Complex Number"])
    for idx, num in enumerate(numbers):
        table.add_row([idx, str(num).replace("j", "i")])
    return table.draw()

def list_real(numbers: list[complex], start: int, end: int) -> str:
    """Lists real numbers in a range."""
    if start < 0 or end >= len(numbers) or start > end:
        raise InvalidIndex("Invalid range.")
    table = Texttable()
    table.header(["Index", "Real Number"])
    for idx, num in enumerate(numbers[start:end + 1], start):
        if num.imag == 0:
            table.add_row([idx, num.real])
    return table.draw()

def list_modulo(numbers: list[complex], operator: str, value: float) -> str:
    """Lists numbers by modulo condition."""
    table = Texttable()
    table.header(["Index", "Complex Number", "Modulo"])
    for idx, num in enumerate(numbers):
        modulo = abs(num)
        if (operator == "<" and modulo < value) or \
           (operator == "=" and modulo == value) or \
           (operator == ">" and modulo > value):
            table.add_row([idx, str(num).replace("j", "i"), round(modulo, 2)])
    return table.draw()

# Random Initialization
def initialize_numbers() -> list[complex]:
    """Generates a list of 10 random complex numbers."""
    return [complex(random.randint(-10, 10), random.randint(-10, 10)) for _ in range(10)]