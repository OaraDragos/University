# Solve the problem from the first set here
from datetime import datetime


#problema cu numarul 3

def smallestNum(n:int) -> int:
    if n < 10:
        return n

    a = [0] * 10
    while n > 0:
        a[n % 10] += 1
        n //= 10
    m=0
    for i in range (1,10):
       while a[i]>0:
        m = m * 10 + i
        a[i]=a[i]-1
    return m




n=int(input("enter a number: "))
print(smallestNum(n))

