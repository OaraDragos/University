class Movie:
    def __init__(self, movie_id: int, title: str, description: str, genre: str):
        self.movie_id = movie_id
        self.title = title
        self.description = description
        self.genre = genre

    def __str__(self):
        return f"Movie(movie_id={self.movie_id}, title={self.title}, description={self.description}, genre={self.genre})"