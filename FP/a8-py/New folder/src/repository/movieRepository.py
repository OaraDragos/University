import pickle
import unittest

from src.domain.movie import Movie

class MovieRepositoryError(Exception):
    def __init__(self, message):
        self.message = message

    def __str__(self):
        return self.message

class MemoryTestRepository(unittest.TestCase):
    def setUp(self):
        self.repository = MovieMemoryRepository()
        self.movie = Movie(1, "The Shawshank Redemption", "Two imprisoned", "Drama")

    def test_add_movie(self):
        self.repository.add_movie(self.movie)
        self.assertIn(self.movie, self.repository.get_movies())

    def test_remove_movie(self):
        self.repository.add_movie(self.movie)
        self.repository.remove_movie(1)
        self.assertNotIn(self.movie, self.repository.get_movies())

    def test_remove_movie_not_found(self):
        if self.assertRaises(ValueError):
            self.repository.remove_movie(1)

    def test_update_movie(self):
        self.repository.add_movie(self.movie)
        self.repository.update_movie(1, "The Shawshank Redemption", "Two imprisoned", "Drama")

    def test_update_movie_not_found(self):
        if self.assertRaises(ValueError):
            self.repository.update_movie(1, "The Shawshank Redemption", "Two imprisoned", "Drama")

    def test_get_movies(self):
        self.repository.add_movie(self.movie)
        self.assertEqual(self.repository.get_movies(), [self.movie])

    def test_get_movies_empty(self):
        self.assertEqual(self.repository.get_movies(), [])

    def test_search_movie(self):
        self.repository.add_movie(self.movie)
        self.assertEqual(self.repository.search_movie("The Shawshank Redemption"), self.movie)

    def test_search_movie_not_found(self):
        if self.assertRaises(ValueError):
            self.repository.search_movie("The Shawshank Redemption")


class MovieMemoryRepository:
    def __init__(self):
        self.list_of_movies = []

    def add_movie(self, movie):
        for movie_from_list in self.list_of_movies:
            if movie_from_list.movie_id == movie.movie_id:
                raise MovieRepositoryError("Movie already exists")
        self.list_of_movies.append(movie)

    def remove_movie(self, movie_id):
        for movie in self.list_of_movies:
            if movie.movie_id == movie_id:
                self.list_of_movies.remove(movie)
                return
        raise MovieRepositoryError("Movie not found")

    def update_movie(self, movie_id, title, description, genre):
        for movie in self.list_of_movies:
            if  movie.movie_id == movie_id:
                movie.title = title
                movie.description = description
                movie.genre = genre
                return
        raise MovieRepositoryError("Movie not found")

    def search_movie(self, searching_field):
        for movie in self.list_of_movies:
            if searching_field == movie.movie_id or searching_field == movie.title or searching_field == movie.description or searching_field == movie.genre:
                return movie
        raise MovieRepositoryError("Movie not found")

    def get_movies(self):
        return self.list_of_movies

class MovieTextFileRepository(MovieMemoryRepository):
    def __init__(self, file_name):
        super().__init__()
        self._file_name = file_name

    def _read_file(self):
        with open(self._file_name, "r") as file:
            lines = file.readlines()
            for line in lines:
                line = line.strip()
                if line != "":
                    movie_id, title, description, genre = line.split(";")
                    self.list_of_movies.append(Movie(int(movie_id), title, description, genre))

    def _write_file(self):
        with open(self._file_name, "w") as file:
            movie_index = 1
            for movie in self.list_of_movies:
                file.write(f"{movie_index}: {movie}\n")
                movie_index += 1

    def add_movie(self, movie):
        super().add_movie(movie)
        self._write_file()

    def remove_movie(self, movie_id):
        super().remove_movie(movie_id)
        self._write_file()

    def update_movie(self, movie_id, title, description, genre):
        super().update_movie(movie_id, title, description, genre)
        self._write_file()

    def search_movie(self, searching_field):
        self._read_file()
        return super().search_movie(searching_field)

    def get_movies(self):
        self._read_file()
        return self.list_of_movies

class MovieBinaryFileRepository(MovieMemoryRepository):
    def __init__(self, file_name):
        super().__init__()
        self._file_name = file_name

    def _read_file(self):
        with open(self._file_name, "rb") as file:
            self.list_of_movies = pickle.load(file)

    def _write_file(self):
        with open(self._file_name, "wb") as file:
            pickle.dump(self.list_of_movies, file)

    def add_movie(self, movie):
        super().add_movie(movie)
        self._write_file()

    def remove_movie(self, movie_id):
        super().remove_movie(movie_id)
        self._write_file()

    def update_movie(self, movie_id, title, description, genre):
        super().update_movie(movie_id, title, description, genre)
        self._write_file()

    def search_movie(self, searching_field):
        self._read_file()
        return super().search_movie(searching_field)

    def get_movies(self):
        self._read_file()
        return self.list_of_movies

if __name__ == '__main__':
    unittest.main()