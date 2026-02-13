import math
def read_complex_number():
    """Reads a complex number in the form a + bi or a - bi from user input."""
    while True:
        try:
            user_input = input("Enter a complex number (in format a + bi or a - bi): ").strip()
            # Remove spaces and ensure it works with the imaginary part ending with 'i'
            user_input = user_input.replace(' ', '').replace('i', '')

            if '+' in user_input:
                # Split on '+' to separate real and imaginary parts
                parts = user_input.split('+')
                real_part, imaginary_part = int(parts[0]), int(parts[1])

            elif '-' in user_input[1:]:  # Exclude the leading '-' for negative real parts
                # Split on the second '-' to separate real and imaginary parts
                split_index = user_input.rfind('-')  # Find the last '-'
                real_part = int(user_input[:split_index])
                imaginary_part = -int(user_input[split_index+1:])

            else:

                # Handle cases like "a" or "bi" without a '+/-'
                if 'i' in user_input:
                    real_part, imaginary_part = 0, user_input
                else:
                    real_part, imaginary_part = user_input, 0

            return real_part, imaginary_part
        except ValueError:
            print("Invalid format. Please enter in the form a + bi or a - bi.")

def read_complex_number_list():
    real_part=[]
    imaginary_part=[]
    print("Enter complex numbers (type 'done' to finish):")
    while True:
        user_input = input("done? ")
        if user_input.lower() == 'done':
            break
        try:
            realPart,imaginaryPart = read_complex_number()
            real_part.append(realPart)
            imaginary_part.append(imaginaryPart)
        except ValueError:
            print("Invalid input. Try again.")
    return real_part,imaginary_part

def display_list_complex_numbers(real_part,imaginary_part):
    if len(real_part)>len(imaginary_part):
        for i in range(len(real_part)):
            if float(imaginary_part[i])>0:
                print(real_part[i],f"+{imaginary_part[i]}i")
            else:
                print(real_part[i],f"{imaginary_part[i]}i")
    else:
        for i in range(len(imaginary_part)):
            if float(imaginary_part[i]) > 0:
                print(real_part[i],f"+{imaginary_part[i]}i")
            else:
                print(real_part[i],f"{imaginary_part[i]}i")


def module(r, i):
    return math.sqrt(r ** 2 + i ** 2)

def find_the_longest_sequence_of_numbers_with_the_same_module(real_part,imaginary_part):
    """Finds the longest sequence where all numbers have the same real part."""
    max_sequence_real = []
    max_sequence_imaginary = []
    current_sequence_real = []
    current_sequence_imaginary = []

    if len(real_part) != len(imaginary_part):
        raise ValueError("The length of real_part and imaginary_part must be the same.")

    # Start the loop from the first element (index 0)
    for i in range(len(real_part)):
        if i == 0 or module(real_part[i], imaginary_part[i]) == module(real_part[i - 1], imaginary_part[i - 1]):
            # Add the current number to the current sequence
            current_sequence_real.append(real_part[i])
            current_sequence_imaginary.append(imaginary_part[i])
        else:
            # Check if the current sequence is the longest one
            if len(current_sequence_real) > len(max_sequence_real):
                max_sequence_real = current_sequence_real
                max_sequence_imaginary = current_sequence_imaginary

            # Reset the current sequence
            current_sequence_real = [real_part[i]]
            current_sequence_imaginary = [imaginary_part[i]]

    # Check the last sequence
    if len(current_sequence_real) > len(max_sequence_real):
        max_sequence_real = current_sequence_real
        max_sequence_imaginary = current_sequence_imaginary

    return max_sequence_real, max_sequence_imaginary


def max_subarray_sum(arr):
    max_sum = arr[0]
    current_sum = arr[0]

    for i in range(1, len(arr)):
        current_sum = max(arr[i], current_sum + arr[i])
        max_sum = max(max_sum, current_sum)

    return max_sum


def max_subarray_sum_real_part(real_part, imaginary_part):
    # Get the maximum subarray sum for both real and imaginary parts
    result_real = max_subarray_sum(real_part)
    result_imaginary = max_subarray_sum(imaginary_part)

    return result_real, result_imaginary

def exit_program():
    """Exits the application."""
    print("Exiting the application.")
    exit()

def main():
    real_part = []
    imaginary_part = []

    # Define functions for each menu option
    def read_numbers():
        nonlocal real_part,imaginary_part
        real_part,imaginary_part = read_complex_number_list()

    def display_numbers():
            display_list_complex_numbers(real_part,imaginary_part)

    def find_the_longest_sequence_of_numbers_with_the_same_module_dispay():
            result_real=[]
            result_imaginary=[]
            result_real,result_imaginary = find_the_longest_sequence_of_numbers_with_the_same_module(real_part,imaginary_part)
            print("Longest sequence with the same module:")
            display_list_complex_numbers(result_real, result_imaginary)

    def max_subarray_sum_real_part_display():
        result_real,result_imaginary = max_subarray_sum_real_part(real_part,imaginary_part)
        print("Longest subsequence with sum being real:")
        display_list_complex_numbers(result_real, result_imaginary)

    # Dictionary for menu options
    menu_options = {
        '1': ('Read a list of complex numbers', read_numbers),
        '2': ('Display the list of complex numbers', display_numbers),
        '3': ('Find longest sequence with the same module',find_the_longest_sequence_of_numbers_with_the_same_module_dispay),
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