def find_first_sum_of_elements_from_list_equal_to_number(listofelements, numbertobeequalttoasumOfElements):
    # Create a set to store numbers we've seen so far
    seenElementsfromList = set()

    for numberfromList in listofelements:
        # Calculate the complement needed to reach the sum x
        complement = numbertobeequalttoasumOfElements - numberfromList

        # Check if the complement exists in the set
        if complement in seenElementsfromList:
            return (complement, numberfromList)

        # Add the current number to the set
        seenElementsfromList.add(numberfromList)

    # If no pair is found
    return None

def find_first_sum_of_elements_from_list_equal_to_number_naive(lst, x):
    # Helper function for backtracking
    def backtrack(index, current_sum, current_elements):
        # Base case: if the current sum matches x, return the elements
        if current_sum == x:
            return current_elements

        # If index goes out of bounds or sum exceeds x, stop further exploration
        if index >= len(lst) or current_sum > x:
            return None

        # Include the current element and move to the next
        include_result = backtrack(index + 1, current_sum + lst[index], current_elements + [lst[index]])
        if include_result:
            return include_result

        # Exclude the current element and move to the next
        exclude_result = backtrack(index + 1, current_sum, current_elements)
        return exclude_result

    # Start the backtracking from the first element
    return backtrack(0, 0, [])
def InputList(NumberofElemntsofTheList):
    List=[]
    for i in range(NumberofElemntsofTheList):
        List.append(int(input("Enter a number in List: ")))
    return List




ListofNumbers=[]
NumberofElemntsofTheList=int(input("Enter the lenght of the set: "))
ListofNumbers=InputList(NumberofElemntsofTheList)
NumberEqualToASumofelementsfromthelist=int(input("Enter a number that represents the sum of a subset from the list: "))
print(find_first_sum_of_elements_from_list_equal_to_number(ListofNumbers,NumberEqualToASumofelementsfromthelist))
print(find_first_sum_of_elements_from_list_equal_to_number_naive(ListofNumbers,NumberEqualToASumofelementsfromthelist))



