import unittest
from src.domain.movie import Movie

class TestMovie(unittest.TestCase):
    def setUp(self):
        self.movie = Movie(1, "Inception", "A mind-bending thriller", "Sci-Fi")

    def test_movie_initialization(self):
        self.assertEqual(self.movie.movie_id, 1)
        self.assertEqual(self.movie.title, "Inception")
        self.assertEqual(self.movie.description, "A mind-bending thriller")
        self.assertEqual(self.movie.genre, "Sci-Fi")

    def test_movie_id_setter(self):
        self.movie.movie_id = 2
        self.assertEqual(self.movie.movie_id, 2)

    def test_movie_title_setter(self):
        self.movie.title = "Interstellar"
        self.assertEqual(self.movie.title, "Interstellar")

    def test_movie_description_setter(self):
        self.movie.description = "A journey through space"
        self.assertEqual(self.movie.description, "A journey through space")

    def test_movie_genre_setter(self):
        self.movie.genre = "Adventure"
        self.assertEqual(self.movie.genre, "Adventure")

if __name__ == '__main__':
    unittest.main()