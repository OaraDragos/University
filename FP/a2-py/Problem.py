import random

RandomList = []


def menu():
    print()
    print("1. Generate a list of n random natural numbers. Generated numbers must be between 0 and 1000.")
    print("2. Search for an item in the list using the algorithm you implemented")
    print("3. Sort the list using the first sorting algorithm you implemented.")
    print("4. Sort the list using the second sorting algorithm you implemented.")
    print("5. Exit the program.")


def RandomNumbers(RandomList):
    '''
    This function generates a list of n random numbers.
    :param RandomList: n is a integer
    :return: the list of n random numbers
    '''
    n = int(input("Enter the number of elements in the list: "))
    for i in range(n):
        RandomList.append(random.randint(0, 1000))
    print(RandomList)


def JumpSearch(x, i, n):
    sqrtN = 0
    sqrtNcpy = int(n ** 0.5)

    for sqrtN in range(0, n, sqrtNcpy):

        while i[sqrtN] >= x:

            if i[sqrtN] == x:
                return sqrtN
            sqrtN = sqrtN - 1
            if i[sqrtN] < x:
                return -1
    return -1


import random


def is_sorted(array):
    for i in range(len(array) - 1):
        if array[i] > array[i + 1]:
            return 0
    return 1


def shuffle(arr):
    print(arr)
    random.shuffle(arr)


def bogoSort(arr):
    while not is_sorted(arr):
        shuffle(arr)


def stoogeSort(s, lef: int, rig: int):
    if rig <= lef:
        return
    if s[lef] > s[rig]:
        s[rig], s[lef] = s[lef], s[rig]
    if rig - lef + 1 > 2:
        t = int((rig - lef + 1) / 3)

        stoogeSort(s, lef, rig - t)
        stoogeSort(s, lef + t, rig)
        stoogeSort(s, lef, rig - t)



h = 0
while h != 5:
    if (h == 1):
        RandomNumbers(RandomList)

    elif (h == 2):
        x = int(input("Enter the number you want to search:"))
        print(JumpSearch(x, RandomList, len(RandomList)))
    elif (h == 3):
        bogoSort(RandomList)
        print(RandomList)
    elif (h == 4):
        stoogeSort(RandomList, 0, len(RandomList))
        print(RandomList)
    menu()
    h = int(input("Enter the number you want to acces:"))
