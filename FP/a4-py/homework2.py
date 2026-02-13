def is_prime(checkingNum)->bool:
    if checkingNum < 2:
        return False
    for i in range(2, int(checkingNum**0.5)+1):
        if checkingNum % i == 0:
            return False
    return True
def generate_primes(n):
    return [i for i in range(2,n+1) if is_prime(i)]


def find_decompositions_backtracking(target_sum, primes_list,result= []):
    """
    Use an iterative approach to find all decompositions of target_sum as sums of primes.

    Args:
    - target_sum (int): Target sum to achieve with prime sums.
    - primes_list (list): List of prime numbers to use.

    Returns:
    - list of lists: All decompositions as sums of primes.
    """

    stack = [(0, 0, [])]  # Each element is (current_sum, start_index, path)

    while stack:
        current_sum, start_index, path = stack.pop()

        # Check if we've found a valid decomposition
        if current_sum == target_sum:
            result.append(path[:])
            continue

        # If we've exceeded the target sum, skip this path
        if current_sum > target_sum:
            continue

        # Try adding each prime starting from `start_index`
        for i in range(start_index, len(primes_list)):
            prime = primes_list[i]
            stack.append((current_sum + prime, i, path + [prime]))  # Include current prime, allowing repeats

    return result


def decompositions_as_prime_sums(n):
    """Wrapper function to generate decompositions as sums of primes."""
    primes_list = generate_primes(n)
    result = []
    find_decompositions_backtracking(n, primes_list,result)
    return result


print(decompositions_as_prime_sums(13))