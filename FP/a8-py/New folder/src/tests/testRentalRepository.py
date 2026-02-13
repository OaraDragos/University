import unittest
from src.domain.rental import Rental
from src.repository.rentalRepository import RentalMemoryRepository, RentalRepositoryError

class TestRentalRepository(unittest.TestCase):
    def setUp(self):
        self.repository = RentalMemoryRepository()
        self.rental = Rental(1, 1, 1, "2023-01-01", "2023-01-10", "2023-01-05")

    def test_rent_movie(self):
        self.repository.rent_movie(self.rental)
        self.assertIn(self.rental, self.repository.get_rentals())


    def test_return_movie(self):
        self.repository.rent_movie(self.rental)
        self.repository.return_movie(1, "2023-01-05")
        self.assertNotIn(self.rental, self.repository.get_rentals())

    def test_get_rentals(self):
        self.repository.rent_movie(self.rental)
        self.assertEqual(self.repository.get_rentals(), [self.rental])

if __name__ == '__main__':
    unittest.main()