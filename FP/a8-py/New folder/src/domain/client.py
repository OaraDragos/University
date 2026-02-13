class Client:
    def __init__(self, client_id: int, name: str):
        self.client_id = client_id
        self.name = name

    def __str__(self):
        return f"Client(client_id={self.client_id}, name={self.name})"