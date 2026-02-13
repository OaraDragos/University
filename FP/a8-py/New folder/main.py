import configparser
import random

from faker import Faker
from datetime import datetime

from src.repository import movieRepository, clientRepository, rentalRepository
from src.services.services import Services
from src.ui.userInterface import UserInterface


class ConfigurationError(Exception):
    pass


def load_settings():
    config = configparser.ConfigParser()

    if not config.read("settings.properties"):
        raise ConfigurationError(
            "The settings.properties file could not be read. Ensure the file exists and is in the correct location.")

    if "repository" not in config:
        raise ConfigurationError("Missing [repository] section in settings.properties")

    repository_section = config["repository"]
    if "repository" not in repository_section:
        raise ConfigurationError("Missing repository type in settings.properties")

    repository_type = repository_section["repository"]

    movies_file = repository_section.get("movies", "")
    clients_file = repository_section.get("clients", "")
    rentals_file = repository_section.get("rentals", "")

    return repository_type, movies_file, clients_file, rentals_file


def create_repository(repository_type, entity_type, file_path):
    if repository_type == "inmemory" and entity_type == "movie":
        return movieRepository.MovieMemoryRepository()
    elif repository_type == "inmemory" and entity_type == "client":
        return clientRepository.ClientMemoryRepository()
    elif repository_type == "textfiles" and entity_type == "client":
        return clientRepository.ClientTextFileRepository(file_path)
    elif repository_type == "textfiles" and entity_type == "movie":
        return movieRepository.MovieTextFileRepository(file_path)
    elif repository_type == "binaryfiles" and entity_type == "client":
        return clientRepository.ClientBinaryFileRepository(file_path)
    elif repository_type == "binaryfiles" and entity_type == "movie":
        return movieRepository.MovieBinaryFileRepository(file_path)
    elif repository_type == "inmemory" and entity_type == "rental":
        return rentalRepository.RentalMemoryRepository()
    elif repository_type == "textfiles" and entity_type == "rental":
        return rentalRepository.RentalTextFileRepository(file_path)
    elif repository_type == "binaryfiles" and entity_type == "rental":
        return rentalRepository.RentalBinaryFileRepository(file_path)
    else:
        raise ConfigurationError(f"Unsupported repository type: {repository_type}")


def due_date_calculator(rented_date) -> str:
    if isinstance(rented_date, datetime):
        rented_date = rented_date.strftime("%Y-%m-%d")

    rented_date_strip = datetime.strptime(rented_date, "%Y-%m-%d")
    rented_date_year, rented_date_month, rented_date_day = rented_date_strip.year, rented_date_strip.month, rented_date_strip.day

    if rented_date_day == 31:
        if rented_date_month == 12:
            due_date_year, due_date_month, due_date_day = rented_date_year + 1, 1, 1
        else:
            due_date_year, due_date_month, due_date_day = rented_date_year, rented_date_month + 1, 1
    else:
        due_date_year, due_date_month, due_date_day = rented_date_year, rented_date_month, rented_date_day + 1

    return f"{due_date_year}-{due_date_month:02d}-{due_date_day:02d}"

def generate_20_entities(services):
    faker = Faker()

    movies_title = ["The Shawshank Redemption",
                    "Inception",
                    "The Dark Knight",
                    "Forrest Gump",
                    "Gladiator"]

    movies_description = ["A man escapes prison after forming a deep friendship and finding hope.",
                          "A thief enters dreams to plant an idea, blurring reality and illusion.",
                          "Batman battles the Joker, testing his morals and heroism.",
                          "A man with a simple view of life impacts major historical events.",
                          "A betrayed general seeks revenge as a gladiator in ancient Rome."]

    movies_genre = ["Drama, Crime",
                    "Sci-Fi, Action, Thriller",
                    "Action, Crime, Drama",
                    "Drama, Romance",
                    "Action, Adventure, Drama"]

    client_id_index, movie_id_index, rental_id_index = 100, 100, 100
    for _ in range(20):
        random_movie = random.choice(movies_title)
        movies_index = movies_title.index(random_movie)
        services.add_client(client_id_index, faker.name())
        services.add_movie(movie_id_index, random_movie, movies_description[movies_index], movies_genre[movies_index])

        client = services.search_client(client_id_index)
        movie = services.search_movie(movie_id_index)
        rented_date = faker.date_time()
        services.rent_movie(rental_id_index, client.client_id, movie.movie_id, rented_date,
                            due_date_calculator(rented_date), "NULL")

        client_id_index += 1
        movie_id_index += 1
        rental_id_index += 1

def main():
    while True:
        try:
            repository_type, movies_file, clients_file, rentals_file = load_settings()
            movie_repository = create_repository(repository_type, "movie", movies_file)
            client_repository = create_repository(repository_type, "client", clients_file)
            rental_repository = create_repository(repository_type, "rental", rentals_file)

            services = Services(movie_repository, client_repository, rental_repository)
            user_interface = UserInterface(services, movie_repository, client_repository)

            generate_20_entities(services)

            user_interface.run_program()
        except ConfigurationError as config_error:
            print(f"Configuration error: {config_error}")
        except KeyboardInterrupt:
            print("\nProgram interrupted by user. Exiting...")
        except Exception as exception_error:
            print(f"An unexpected error occurred: {exception_error}")


if __name__ == '__main__':
    main()
