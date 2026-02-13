import unittest

from src.domain.client import Client
from src.domain.movie import Movie
from src.domain.rental import Rental

class UnitTestsForFirstFunctionality(unittest.TestCase):
    def __init__(self, movie_repository, client_repository, rental_repository):
        super().__init__()
        self.movie_repository = movie_repository
        self.client_repository = client_repository
        self.rental_repository = rental_repository
        self.client = Client(1, "John Doe")
        self.movie = Movie(1, "Title", "Description", "Genre")

    def test_add_movie(self):
        self.movie_repository.add_movie(self.movie)
        self.assertIn(self.movie, self.movie_repository.get_movies())

    def add_client(self):
        self.client_repository.add_client(self.client)
        self.assertIn(self.client, self.client_repository.get_clients())

    def test_remove_movie(self):
        self.movie_repository.add_movie(self.movie)
        self.movie_repository.remove_movie(1)
        self.assertNotIn(self.movie, self.movie_repository.get_movies())

    def test_remove_movie_not_found(self):
        with self.assertRaises(ValueError):
            self.movie_repository.remove_movie(1)

    def test_remove_client(self):
        self.client_repository.add_client(self.client)
        self.client_repository.remove_client(1)
        self.assertNotIn(self.client, self.client_repository.get_clients())

    def test_remove_client_not_found(self):
        with self.assertRaises(ValueError):
            self.client_repository.remove_client(1)

    def test_update_movie(self):
        self.movie_repository.add_movie(self.movie)
        self.movie_repository.update_movie(1, "Title", "Description", "Genre")

    def test_update_movie_not_found(self):
        with self.assertRaises(ValueError):
            self.movie_repository.update_movie(1, "Title", "Description", "Genre")

    def test_update_client(self):
        self.client_repository.add_client(self.client)
        self.client_repository.update_client(1, "John Doe")
        self.assertEqual(self.client.name, "John Doe")

    def test_update_client_not_found(self):
        with self.assertRaises(ValueError):
            self.client_repository.update_client(1, "John Doe")

    def test_get_movie(self):
        self.movie_repository.add_movie(self.movie)
        self.assertEqual(self.movie_repository.get_movies(), [self.movie])

    def test_get_client(self):
        self.client_repository.add_client(self.client)
        self.assertEqual(self.client_repository.get_clients(), [self.client])


class Services:
    def __init__(self, movie_repository, client_repository, rental_repository):
        self.movie_repository = movie_repository
        self.client_repository = client_repository
        self.rental_repository = rental_repository

    def rent_movie(self, rental_id, movie_id, client_id, rented_date, due_date, returned_date):
        rental = Rental(rental_id, movie_id, client_id, rented_date, due_date, returned_date)
        self.rental_repository.rent_movie(rental)

    def return_movie(self, rental_id, returned_date):
        self.rental_repository.return_movie(rental_id, returned_date)

    def add_client(self, client_id, name):
        client = Client(client_id, name)
        self.client_repository.add_client(client)

    def add_movie(self, movie_id, title, description, genre):
        movie = Movie(movie_id, title, description, genre)
        self.movie_repository.add_movie(movie)

    def search_movie(self, searching_field):
        return self.movie_repository.search_movie(searching_field)

    def search_client(self, searching_field):
        return self.client_repository.search_client(searching_field)

    def remove_movie(self, movie_id):
        self.movie_repository.remove_movie(movie_id)

    def remove_client(self, client_id):
        self.client_repository.remove_client(client_id)

    def update_movie(self, movie_id, title, description, genre):
        self.movie_repository.update_movie(movie_id, title, description, genre)

    def update_client(self, client_id, name):
        self.client_repository.update_client(client_id, name)

    def get_movies(self):
        return self.movie_repository.get_movies()

    def get_clients(self):
        return self.client_repository.get_clients()

    def get_rentals(self):
        return self.rental_repository.get_rentals()