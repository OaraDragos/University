import unittest
from src.domain.rental import Rental

class TestRental(unittest.TestCase):
    def setUp(self):
        self.rental = Rental(1, 1, 1, "2023-01-01", "2023-01-10", "2023-01-05")

    def test_rental_initialization(self):
        self.assertEqual(self.rental.rental_id, 1)
        self.assertEqual(self.rental.client_id, 1)
        self.assertEqual(self.rental.movie_id, 1)
        self.assertEqual(self.rental.rented_date, "2023-01-01")
        self.assertEqual(self.rental.due_date, "2023-01-10")
        self.assertEqual(self.rental.returned_date, "2023-01-05")

    def test_rental_id_setter(self):
        self.rental.rental_id = 2
        self.assertEqual(self.rental.rental_id, 2)

    def test_client_id_setter(self):
        self.rental.client_id = 2
        self.assertEqual(self.rental.client_id, 2)

    def test_movie_id_setter(self):
        self.rental.movie_id = 2
        self.assertEqual(self.rental.movie_id, 2)

    def test_rented_date_setter(self):
        self.rental.rented_date = "2023-01-02"
        self.assertEqual(self.rental.rented_date, "2023-01-02")

    def test_due_date_setter(self):
        self.rental.due_date = "2023-01-11"
        self.assertEqual(self.rental.due_date, "2023-01-11")

    def test_returned_date_setter(self):
        self.rental.returned_date = "2023-01-06"
        self.assertEqual(self.rental.returned_date, "2023-01-06")

if __name__ == '__main__':
    unittest.main()