import unittest
from src.domain.client import Client

class TestClient(unittest.TestCase):
    def setUp(self):
        self.client = Client(1, "John Doe")

    def test_client_initialization(self):
        self.assertEqual(self.client.client_id, 1)
        self.assertEqual(self.client.name, "John Doe")

    def test_client_id_setter(self):
        self.client.client_id = 2
        self.assertEqual(self.client.client_id, 2)

    def test_client_name_setter(self):
        self.client.name = "Jane Doe"
        self.assertEqual(self.client.name, "Jane Doe")

if __name__ == '__main__':
    unittest.main()