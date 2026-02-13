from faker.providers.company.pt_BR import company_id_checksum

from src.domain.client import Client
from src.domain.movie import Movie
from src.domain.rental import Rental
from faker import Faker


class UserInterface:
    def __init__(self, service, movie_repository, client_repository):
        self.movie_repository = movie_repository
        self.client_repository = client_repository
        self.service = service

    @staticmethod
    def print_menu():
        print("Choose an option:")
        print("1. Manage clients and movies")
        print("2. Rent or return a movie")
        print("3. Search for clients or movies")
        print("0. Exit")

    @staticmethod
    def try_and_except_user_choice(left_bound: int, right_bound: int) -> int:
        while True:
            try:
                user_choice = int(input("Enter option: "))
                if user_choice < left_bound or user_choice > right_bound:
                    raise ValueError("Invalid option")
                return user_choice
            except ValueError as value_error:
                print(value_error)

    @staticmethod
    def try_and_except_user_input_for_int(message: str) -> int:
        while True:
            try:
                user_input = int(input(f"Enter {message}: "))
                return user_input
            except ValueError as value_error:
                print(value_error)

    @staticmethod
    def try_and_except_user_input_for_str(message: str) -> str:
        while True:
            try:
                user_input = input(f"Enter {message}: ")
                return user_input
            except ValueError as value_error:
                print(value_error)

    def run_program(self):
        manage_option, rent_option, search_option, exit_option = 1, 2, 3, 0
        while True:
            self.print_menu()
            user_choice = self.try_and_except_user_choice(0, 3)
            if user_choice == manage_option:
                print("Choose an option:")
                print("1. Add client")
                print("2. Add movie")
                print("3. Remove client")
                print("4. Remove movie")
                print("5. Update client")
                print("6. Update movie")
                print("7. Display clients")
                print("8. Display movies")
                print("9. Go back")
                user_choice = self.try_and_except_user_choice(1, 9)
                add_client_option, add_movie_option, remove_client_option, remove_movie_option, update_client_option, update_movie_option, display_clients_option, display_movies_option, go_back_option = 1, 2, 3, 4, 5, 6, 7, 8, 9
                if user_choice == add_client_option:
                    client_id = self.try_and_except_user_input_for_int("client ID")
                    name = self.try_and_except_user_input_for_str("client name")
                    self.service.add_client(client_id, name)
                elif user_choice == add_movie_option:
                    movie_id = self.try_and_except_user_input_for_int("movie ID")
                    title = self.try_and_except_user_input_for_str("movie title")
                    description = self.try_and_except_user_input_for_str("movie description")
                    genre = self.try_and_except_user_input_for_str("movie genre")
                    self.service.add_movie(movie_id, title, description, genre)
                elif user_choice == remove_client_option:
                    client_id = self.try_and_except_user_input_for_int("client ID")
                    self.service.remove_client(client_id)
                elif user_choice == remove_movie_option:
                    movie_id = self.try_and_except_user_input_for_int("movie ID")
                    self.service.remove_movie(movie_id)
                elif user_choice == update_client_option:
                    client_id = self.try_and_except_user_input_for_int("client ID")
                    name = self.try_and_except_user_input_for_str("client name")
                    self.service.update_client(client_id, name)
                elif user_choice == update_movie_option:
                    movie_id = self.try_and_except_user_input_for_int("movie ID")
                    title = self.try_and_except_user_input_for_str("movie title")
                    description = self.try_and_except_user_input_for_str("movie description")
                    genre = self.try_and_except_user_input_for_str("movie genre")
                    self.service.update_movie(movie_id, title, description, genre)
                elif user_choice == display_clients_option:
                    clients = self.service.get_clients()
                    if not clients:
                        print("No clients available.")
                    else:
                        for client_index, client in enumerate(clients):
                            print(f"{client_index + 1}: {client}")
                elif user_choice == display_movies_option:
                    movies = self.service.get_movies()
                    if not movies:
                        print("No movies available.")
                    else:
                        for movie_index, movie in enumerate(movies):
                            print(f"{movie_index + 1}: {movie}")
                elif user_choice == go_back_option:
                    continue
            elif user_choice == rent_option:
                print("Choose an option:")
                print("1. Rent movie")
                print("2. Return movie")
                print("3. Display rentals")
                print("4. Go back")
                user_choice = self.try_and_except_user_choice(1, 4)
                rent_movie_option, return_movie_option, display_rentals_option, go_back_option = 1, 2, 3, 4
                if user_choice == rent_movie_option:
                    rental_id = self.try_and_except_user_input_for_int("rental ID")
                    movie_id = self.try_and_except_user_input_for_int("movie ID")
                    client_id = self.try_and_except_user_input_for_int("client ID")
                    rented_date = self.try_and_except_user_input_for_str("rented date")
                    due_date = self.try_and_except_user_input_for_str("due date")
                    returned_date = self.try_and_except_user_input_for_str("returned date")
                    self.service.rent_movie(rental_id, movie_id, client_id, rented_date, due_date, returned_date)

                    faker = Faker()
                    rental = Rental(rental_id, movie_id, client_id, rented_date, due_date, returned_date)
                    movie = Movie(rental.movie_id, faker.word(), faker.sentence(), faker.word())
                    client = Client(rental.client_id, faker.name())
                    self.movie_repository.add_movie(movie)
                    self.client_repository.add_client(client)
                elif user_choice == return_movie_option:
                    rental_id = self.try_and_except_user_input_for_int("rental ID")
                    returned_date = self.try_and_except_user_input_for_str("returned date")
                    self.service.return_movie(rental_id, returned_date)
                elif user_choice == display_rentals_option:
                    rentals = self.service.get_rentals()
                    if not rentals:
                        print("No rentals available.")
                    else:
                        for rental_index, rental in enumerate(rentals):
                            print(f"{rental_index + 1}: {rental}")
                elif user_choice == go_back_option:
                    continue
            elif user_choice == search_option:
                print("Choose an option:")
                print("1. Search for client")
                print("2. Search for movie")
                print("3. Go back")
                user_choice = self.try_and_except_user_choice(1, 3)
                search_client_option, search_movie_option, go_back_option = 1, 2, 3
                if user_choice == search_client_option:
                    print("Choose an option:")
                    print("1. Search by ID")
                    print("2. Search by name")
                    print("3. Go back")
                    user_choice = self.try_and_except_user_choice(1, 3)
                    search_id_option, search_name_option, go_back_option = 1, 2, 3
                    if user_choice == search_id_option:
                        searching_field = self.try_and_except_user_input_for_int("client ID")
                        self.service.search_client(searching_field)
                    elif user_choice == search_name_option:
                        searching_field = self.try_and_except_user_input_for_str("client name")
                        self.service.search_client(searching_field)
                    elif user_choice == go_back_option:
                        continue
                elif user_choice == search_movie_option:
                    print("Choose an option:")
                    print("1. Search by ID")
                    print("2. Search by title")
                    print("3. Search by description")
                    print("4. Search by genre")
                    print("5. Go back")
                    user_choice = self.try_and_except_user_choice(1, 5)
                    search_id_option, search_title_option, search_description_option, search_genre_option, go_back_option = 1, 2, 3, 4, 5
                    if user_choice == search_id_option:
                        searching_field = self.try_and_except_user_input_for_int("movie ID")
                        print(self.service.search_movie(searching_field))
                    elif user_choice == search_title_option:
                        searching_field = self.try_and_except_user_input_for_str("movie title")
                        print(self.service.search_movie(searching_field))
                    elif user_choice == search_description_option:
                        searching_field = self.try_and_except_user_input_for_str("movie description")
                        print(self.service.search_movie(searching_field))
                    elif user_choice == search_genre_option:
                        searching_field = self.try_and_except_user_input_for_str("movie genre")
                        print(self.service.search_movie(searching_field))
                    elif user_choice == go_back_option:
                        continue
                elif user_choice == go_back_option:
                    continue
            elif user_choice == exit_option:
                print("Exiting the program...")
                break