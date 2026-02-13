
k=int(input("baga numar perfect boss:"))
print(celMaiMNrPerf(k))

def fib(n:int) -> int:
    if 2 < n:
        return fib(n-2) + fib(n-1)
    return n
n=int(input("enter n:"))
l=0
while fib(l) < n:
    l +=1
print(fib(l))
