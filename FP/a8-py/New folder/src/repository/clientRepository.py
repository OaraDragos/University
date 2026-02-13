import pickle
import unittest

from src.domain.client import Client


class ClientRepositoryError(Exception):
    def __init__(self, message):
        self.message = message

    def __str__(self):
        return self.message

class ClientTestRepository(unittest.TestCase):
    def setUp(self):
        self.repository = ClientMemoryRepository()
        self.client = Client(1, "John Doe")

    def test_add_client(self):
        self.repository.add_client(self.client)
        self.assertIn(self.client, self.repository.get_clients())

    def test_remove_client(self):
        self.repository.add_client(self.client)
        self.repository.remove_client(1)
        self.assertNotIn(self.client, self.repository.get_clients())

    def test_update_client(self):
        self.repository.add_client(self.client)
        self.repository.update_client(1, "Jane Doe")
        self.assertEqual(self.client['name'], "Jane Doe")

    def test_get_clients(self):
        self.repository.add_client(self.client)
        self.assertEqual(self.repository.get_clients(), [self.client])

    def test_search_client(self):
        self.repository.add_client(self.client)
        self.assertEqual(self.repository.search_client("John Doe"), self.client)


class ClientMemoryRepository:
    def __init__(self):
        self.list_of_clients = []

    def add_client(self, client):
        for client_from_list in self.list_of_clients:
            if client_from_list.client_id == client.client_id:
                raise ClientRepositoryError("Client already exists")
        self.list_of_clients.append(client)

    def remove_client(self, client_id):
        for client in self.list_of_clients:
            if client.client_id == client_id:
                self.list_of_clients.remove(client)
                return
        raise ClientRepositoryError("Client not found")

    def update_client(self, client_id, name):
        for client in self.list_of_clients:
            if client.client_id == client_id:
                client.name = name
                return
        raise ClientRepositoryError("Client not found")

    def get_clients(self):
        return self.list_of_clients

    def search_client(self, searching_field):
        for client in self.list_of_clients:
            if searching_field == client.client_id or searching_field == client.name:
                return client
        raise ClientRepositoryError("Client not found")


class ClientTextFileRepository(ClientMemoryRepository):
    def __init__(self, file_name):
        super().__init__()
        self._file_name = file_name

    def _read_file(self):
        with open(self._file_name, "r") as file:
            lines = file.readlines()
            for line in lines:
                line = line.strip()
                if line != "":
                    client_id, name = line.split(";")
                    self.list_of_clients.append(Client(int(client_id), name))

    def _write_file(self):
        with open(self._file_name, "w") as file:
            client_index = 1
            for client in self.list_of_clients:
                file.write(f"{client_index + 1}: {client}\n")
                client_index += 1

    def add_client(self, client):
        super().add_client(client)
        self._write_file()

    def remove_client(self, client_id):
        super().remove_client(client_id)
        self._write_file()

    def update_client(self, client_id, name):
        super().update_client(client_id, name)
        self._write_file()

    def get_clients(self):
        self._read_file()
        return super().get_clients()

    def search_client(self, searching_field):
        self._read_file()
        return super().search_client(searching_field)


class ClientBinaryFileRepository(ClientMemoryRepository):
    def __init__(self, file_name):
        super().__init__()
        self._file_name = file_name

    def _read_file(self):
        with open(self._file_name, "rb") as file:
            self.list_of_clients = pickle.load(file)

    def _write_file(self):
        with open(self._file_name, "wb") as file:
            pickle.dump(self.list_of_clients, file)

    def add_client(self, client):
        super().add_client(client)
        self._write_file()

    def remove_client(self, client_id):
        super().remove_client(client_id)
        self._write_file()

    def update_client(self, client_id, name):
        super().update_client(client_id, name)
        self._write_file()

    def get_clients(self):
        self._read_file()
        return super().get_clients()

    def search_client(self, searching_field):
        self._read_file()
        return super().search_client(searching_field)


if __name__ == '__main__':
    unittest.main()
