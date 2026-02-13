class Rental:

    def __init__(self, rental_id: int, movie_id: int, client_id: int, rented_date: str, due_date: str, returned_date: str):
        self.rental_id = rental_id
        self.movie_id = movie_id
        self.client_id = client_id
        self.rented_date = rented_date
        self.due_date = due_date
        self.returned_date = returned_date

    def __str__(self):
        return f"Rental(rental_id={self.rental_id}, movie_id={self.movie_id}, client_id={self.client_id}, rented_date={self.rented_date}, due_date={self.due_date}, returned_date={self.returned_date})"