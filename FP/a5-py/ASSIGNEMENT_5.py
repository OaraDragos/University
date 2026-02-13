def read_complex_number():
    """Reads a complex number in the form a + bi from user input."""
    while True:
        try:
            user_input = input("Enter a complex number (in format a + bi): ")
            # Remove spaces and split based on '+' or '-' for real and imaginary parts
            user_input = user_input.replace(' ', '').replace('i', '')
            if '+' in user_input:
                parts = user_input.split('+')
                realPart, imaginaryPart = float(parts[0]), float(parts[1])
            elif '-' in user_input[1:]:  # To handle numbers like 'a - bi'
                parts = user_input.split('-')
                realPart = float(parts[0])
                imaginaryPart = -float(parts[1])
            else:
                # Handle cases like "a" or "bi"
                realPart, imaginaryPart = float(user_input), 0.0 if 'i' not in user_input else float(user_input[:-1])
            return complex(realPart, imaginaryPart)
        except ValueError:
            print("Invalid format. Please enter in the form a + bi.")


def read_complex_list():
    """Reads a list of complex numbers from user input."""
    numbers = []
    print("Enter complex numbers (type 'done' to finish):")
    while True:
        user_input = input("done? ")
        if user_input.lower() == 'done':
            break
        try:
            number= read_complex_number()
            numbers.append(number)
        except ValueError:
            print("Invalid input. Try again.")
    return numbers


def display_complex_list(numbers):
    """Displays the list of complex numbers."""
    print("List of complex numbers:")
    for number in numbers:
        print(number)


def find_the_longest_sequence_of_numbers_with_the_same_module(numbers):
    """Finds the longest sequence where all numbers have the same real part."""
    max_sequence = []
    current_sequence = [numbers[0]] if numbers else []

    for i in range(1, len(numbers)):
        '''a^2+b^2== x^2+y^2'''
        if numbers[i].real*numbers[i].real+numbers[i].imag*numbers[i].imag == numbers[i - 1].real*numbers[i - 1].real+numbers[i - 1].imag*numbers[i - 1].imag:
            current_sequence.append(numbers[i])
        else:
            if len(current_sequence) > len(max_sequence):
                max_sequence = current_sequence
            current_sequence = [numbers[i]]

    if len(current_sequence) > len(max_sequence):
        max_sequence = current_sequence

    return max_sequence



def exit_program():
    """Exits the application."""
    print("Exiting the application.")
    exit()


def max_subarray_sum_real_part(array):
    # Step 1: Extract real parts from the complex numbers
    real_parts = [x.real for x in array]

    # Step 2: Apply Kadane's Algorithm on the real parts to find the maximum subarray sum
    max_sum = float('-inf')
    current_sum = 0
    start = end = s = 0

    for i in range(len(real_parts)):
        current_sum += real_parts[i]

        if current_sum > max_sum:
            max_sum = current_sum
            start = s
            end = i

        if current_sum < 0:
            current_sum = 0
            s = i + 1

    # Step 3: Extract the maximum subarray from the original complex numbers array
    max_subarray = array[start:end + 1]


    return max_subarray
def main():
    numbers = []

    # Define functions for each menu option
    def read_numbers():
        nonlocal numbers
        numbers = read_complex_list()

    def display_numbers():
        display_complex_list(numbers)

    def find_the_longest_sequence_of_numbers_with_the_same_module_dispay():
        result = find_the_longest_sequence_of_numbers_with_the_same_module(numbers)
        print("Longest sequence with the same real part:", result)

    def max_subarray_sum_real_part_display():
        result = max_subarray_sum_real_part(numbers)
        print("Longest subsequence with sum being real:", result)

    # Dictionary for menu options
    menu_options = {
        '1': ('Read a list of complex numbers', read_numbers),
        '2': ('Display the list of complex numbers', display_numbers),
        '3': ('Find longest sequence with the same real part', find_the_longest_sequence_of_numbers_with_the_same_module_dispay),
        '4': ('Find subsequence with sum being real', max_subarray_sum_real_part_display),
        '5': ('Exit', exit_program)
    }

    # Menu loop
    while True:
        print("\n--- Complex Number Menu ---")
        for key, (description, _) in menu_options.items():
            print(f"{key}. {description}")

        choice = input("Choose an option: ")

        # Execute the corresponding function based on user choice
        if choice in menu_options:
            action = menu_options[choice][1]
            action()
        else:
            print("Invalid option. Please choose again.")


if __name__ == "__main__":
    main()