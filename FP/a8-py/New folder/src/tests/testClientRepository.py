import unittest
from src.domain.client import Client
from src.repository.clientRepository import ClientMemoryRepository, ClientRepositoryError

class TestClientRepository(unittest.TestCase):
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

    def test_remove_client_not_found(self):
        with self.assertRaises(ClientRepositoryError):
            self.repository.remove_client(1)

    def test_update_client(self):
        self.repository.add_client(self.client)
        self.repository.update_client(1, "Jane Doe")
        self.assertEqual(self.client.name, "Jane Doe")

    def test_get_clients(self):
        self.repository.add_client(self.client)
        self.assertEqual(self.repository.get_clients(), [self.client])

    def test_search_client(self):
        self.repository.add_client(self.client)
        self.assertEqual(self.repository.search_client("John Doe"), self.client)

if __name__ == '__main__':
    unittest.main()