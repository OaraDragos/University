import unittest

from src.domain.movie import Movie
from src.repository.movieRepository import MovieMemoryRepository, MovieRepositoryError

class TestMovieRepository(unittest.TestCase):
    def setUp(self):
        self.repository = MovieMemoryRepository()
        self.movie = Movie(1, "Inception", "A mind-bending thriller", "Sci-Fi")

    def test_add_movie(self):
        self.repository.add_movie(self.movie)
        self.assertIn(self.movie, self.repository.get_movies())

    def test_remove_movie(self):
        self.repository.add_movie(self.movie)
        self.repository.remove_movie(1)
        self.assertNotIn(self.movie, self.repository.get_movies())

    def test_update_movie(self):
        self.repository.add_movie(self.movie)
        self.repository.update_movie(1, "Interstellar", "A journey through space", "Sci-Fi")
        self.assertEqual(self.movie.title, "Interstellar")
        self.assertEqual(self.movie.description, "A journey through space")
        self.assertEqual(self.movie.genre, "Sci-Fi")
    def test_get_movies(self):
        self.repository.add_movie(self.movie)
        self.assertEqual(self.repository.get_movies(), [self.movie])

    def test_search_movie(self):
        self.repository.add_movie(self.movie)
        self.assertEqual(self.repository.search_movie("Inception"), self.movie)

if __name__ == '__main__':
    unittest.main()
