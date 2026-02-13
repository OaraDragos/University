def is_prime(checkingNum)->bool:
    if checkingNum < 2:
        return False
    for i in range(2, int(checkingNum**0.5)+1):
        if checkingNum % i == 0:
            return False
    return True
def generate_primes(n):
    return [i for i in range(2,n+1) if is_prime(i)]


def find_decompositions_backtracking(Target_sum, primes_list, current_sum=0, path=[], result=[]):
    """
    Use backtracking to find all decompositions of n as sums of primes.

    Args:
    - n (int): Target sum.
    - primes (list): List of prime numbers to use.
    - current_sum (int): Current sum in the backtracking process.
    - path (list): Current path of primes.
    - result (list): Stores all valid decompositions.

    Returns:
    - list of lists: All decompositions as sums of primes.
    """
    if current_sum == Target_sum:
        result.append(path[:])  # Found a valid decomposition
        return
    elif current_sum > Target_sum:
        return  # Exceeded target sum, backtrack

    for i in range(len(primes_list)):
        # Explore with the current prime and remaining primes (allowing repeats)
        path.append(primes_list[i])
        find_decompositions_backtracking(Target_sum, primes_list[i:], current_sum + primes_list[i], path, result)
        path.pop()  # Backtrack


def decompositions_as_prime_sums(n):
    """Wrapper function to generate decompositions as sums of primes."""
    primes_list = generate_primes(n)
    result = []
    find_decompositions_backtracking(n, primes_list, 0, [], result)
    return result


print(decompositions_as_prime_sums(13))