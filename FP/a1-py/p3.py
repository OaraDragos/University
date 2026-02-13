
n=int(input("enter a number: "))
print(smallestNum(n))

# problema 15
def perfNum(n:int) -> bool:
    s=0
    for i in range(1,n):
        if n % i == 0:
            s=s+i
    if s==n or n==1:
        return True
    return False


def celMaiMNrPerf(n:int) -> int:
    while n>0:
        if perfNum(n-1):
            return n-1
        n=n-1



#problema 12
def calculatorzile(BirthDay, BirthMonth, BirthYear, ActualDay, ActualMonth, ActualYear):
    Months = [0, 31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    age = 0
    for i in range(ActualYear, BirthYear - 1, -1):
        if i != ActualYear and i != BirthYear:
            if i % 4 == 0:
                age = age + 366
            else:
                age = age + 365
        else:
            if i % 4 == 0:
                Months[2] = 29
            else:
                Months[2] = 28

            if i != BirthYear and i == ActualYear:
                age = age + ActualDay
                for j in range(ActualMonth - 1, 0, -1):
                    age = age + Months[j]

            elif i == BirthYear and i != ActualYear:
                for j in range(12, BirthMonth, -1):
                    age = age + Months[j]
                age = age + Months[BirthMonth] - BirthDay

            elif i == BirthYear and i == ActualYear:
                if BirthMonth == ActualMonth:
                    for j in range(ActualDay, BirthMonth - 1, -1):
                        age = age + 1
                else:
                    age = age + ActualDay
                    for j in range(ActualMonth, BirthMonth - 1, -1):
                        age = age + Months[j]
                    age = age + Months[BirthMonth] - BirthDay
    return age


BirthDay = int(input("Baga ziua de nastere:"))
BirthMonth = int(input("Baga luna de nastere:"))
BirthYear = int(input("Baga anul de nastere:"))
ActualDay = int(input("Baga ziua actuala:"))
ActualMonth = int(input("Baga luna actuala:"))
ActualYear = int(input("Baga anul actual:"))
print(calculatorzile(BirthDay, BirthMonth, BirthYear, ActualDay, ActualMonth, ActualYear))

