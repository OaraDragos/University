import unittest
from src.services.services import Services
from src.domain.movie import Movie
from src.domain.client import Client
from src.domain.rental import Rental
from src.repository.movieRepository import MovieMemoryRepository
from src.repository.clientRepository import ClientMemoryRepository
from src.repository.rentalRepository import RentalMemoryRepository

class TestServices(unittest.TestCase):
    def setUp(self):
        self.movie_repository = MovieMemoryRepository()
        self.client_repository = ClientMemoryRepository()
        self.rental_repository = RentalMemoryRepository()
        self.services = Services(self.movie_repository, self.client_repository, self.rental_repository)
        self.movie = Movie(1, "Inception", "A mind-bending thriller", "Sci-Fi")
        self.client = Client(1, "John Doe")
        self.rental = Rental(1, 1, 1, "2023-01-01", "2023-01-10", "2023-01-05")

    def test_add_movie(self):
        self.services.add_movie(1, "Inception", "A mind-bending thriller", "Sci-Fi")
        self.assertIn(self.movie, self.movie_repository.get_movies())

    def test_remove_movie(self):
        self.services.add_movie(1, "Inception", "A mind-bending thriller", "Sci-Fi")
        self.services.remove_movie(1)
        self.assertNotIn(self.movie, self.movie_repository.get_movies())

    def test_update_movie(self):
        self.services.add_movie(1, "Inception", "A mind-bending thriller", "Sci-Fi")
        self.services.update_movie(1, "Interstellar", "A journey through space", "Sci-Fi")
        updated_movie = self.movie_repository.search_movie("Interstellar")
        self.assertEqual(updated_movie.title, "Interstellar")
        self.assertEqual(updated_movie.description, "A journey through space")
        self.assertEqual(updated_movie.genre, "Sci-Fi")

    def test_add_client(self):
        self.services.add_client(1, "John Doe")
        self.assertIn(self.client, self.client_repository.get_clients())

    def test_remove_client(self):
        self.services.add_client(1, "John Doe")
        self.services.remove_client(1)
        self.assertNotIn(self.client, self.client_repository.get_clients())

    def test_update_client(self):
        self.services.add_client(1, "John Doe")
        self.services.update_client(1, "Jane Doe")
        updated_client = self.client_repository.search_client(1)
        self.assertEqual(updated_client.name, "Jane Doe")

    def test_rent_movie(self):
        self.services.add_movie(1, "Inception", "A mind-bending thriller", "Sci-Fi")
        self.services.add_client(1, "John Doe")
        self.services.rent_movie(1, 1, 1, "2023-01-01", "2023-01-10", "2023-01-05")
        self.assertIn(self.rental, self.rental_repository.get_rentals())

    def test_return_movie(self):
        self.services.add_movie(1, "Inception", "A mind-bending thriller", "Sci-Fi")
        self.services.add_client(1, "John Doe")
        self.services.rent_movie(1, 1, 1, "2023-01-01", "2023-01-10", "2023-01-05")
        self.services.return_movie(1, "2023-01-05")
        self.assertNotIn(self.rental, self.rental_repository.get_rentals())

if __name__ == '__main__':
    unittest.main()