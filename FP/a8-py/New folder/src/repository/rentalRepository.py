import pickle
import unittest

from src.domain.rental import Rental


class RentalRepositoryError(Exception):
    def __init__(self, message):
        self.message = message

    def __str__(self):
        return self.message


class RentalTestRepository(unittest.TestCase):
    def setUp(self):
        self.repository = RentalMemoryRepository()
        self.rental = Rental(1, 1, 1, "2021-04-01", "2021-04-08", "2021-04-08")

    def test_rent_movie(self):
        self.repository.rent_movie(self.rental)
        self.assertIn(self.rental, self.repository.get_rentals())

    def test_rent_movie_already_exists(self):
        self.repository.rent_movie(self.rental)
        with self.assertRaises(RentalRepositoryError):
            self.repository.rent_movie(self.rental)

    def test_return_movie(self):
        self.repository.rent_movie(self.rental)
        self.repository.return_movie(1, "2021-04-08")
        self.assertNotIn(self.rental, self.repository.get_rentals())

    def test_return_movie_not_found(self):
        with self.assertRaises(RentalRepositoryError):
            self.repository.return_movie(1, "2021-04-08")

    def test_get_rentals(self):
        self.repository.rent_movie(self.rental)
        self.assertEqual(self.repository.get_rentals(), [self.rental])

    def test_get_rentals_empty(self):
        self.assertEqual(self.repository.get_rentals(), [])


class RentalMemoryRepository:
    def __init__(self):
        self.list_of_rentals = []

    def rent_movie(self, rental):
        for rental_from_list in self.list_of_rentals:
            if rental_from_list.rental_id == rental.rental_id:
                raise RentalRepositoryError("Rental already exists")
        self.list_of_rentals.append(rental)

    def return_movie(self, rental_id, returned_date):
        for rental in self.list_of_rentals:
            if rental.rental_id == rental_id:
                self.list_of_rentals.remove(rental)
                return
        raise RentalRepositoryError("Rental not found")

    def get_rentals(self):
        return self.list_of_rentals


class RentalTextFileRepository(RentalMemoryRepository):
    def __init__(self, file_name):
        super().__init__()
        self._file_name = file_name

    def _read_file(self):
        with open(self._file_name, "r") as file:
            lines = file.readlines()
            for line in lines:
                line = line.strip()
                if line != "":
                    rental_id, movie_id, client_id, rented_date, due_date, returned_date = line.split(";")
                    self.list_of_rentals.append(
                        Rental(int(rental_id), int(movie_id), int(client_id), str(rented_date), str(due_date),
                               str(returned_date)))

    def _write_file(self):
        with open(self._file_name, "w") as file:
            rental_index = 1
            for rental in self.list_of_rentals:
                file.write(f"{rental_index}: {rental}\n")
                rental_index += 1

    def rent_movie(self, rental):
        super().rent_movie(rental)
        self._write_file()

    def return_movie(self, rental_id, returned_date):
        super().return_movie(rental_id, returned_date)
        self._write_file()

    def get_rentals(self):
        return super().get_rentals()


class RentalBinaryFileRepository(RentalMemoryRepository):
    def __init__(self, file_name):
        super().__init__()
        self._file_name = file_name

    def _read_file(self):
        with open(self._file_name, "rb") as file:
            try:
                self.list_of_rentals = pickle.load(file)
            except EOFError:
                self.list_of_rentals = []

    def _write_file(self):
        with open(self._file_name, "wb") as file:
            pickle.dump(self.list_of_rentals, file)

    def rent_movie(self, rental):
        super().rent_movie(rental)
        self._write_file()

    def return_movie(self, rental_id, returned_date):
        super().return_movie(rental_id, returned_date)
        self._write_file()

    def get_rentals(self):
        super().get_rentals()
