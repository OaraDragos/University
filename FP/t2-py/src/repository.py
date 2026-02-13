from src.domain import Entities,Entity


class File_Repository:
    def __init__(self,file_path):
        self.file_path = file_path
    def save_from_file(self):
        entities=Entities()
        with open(self.file_path,'r') as file:
            for line in file:
                id,name,number,x,y=line.strip().split(",")
                entities.add(Entity(id,name,number,x,y))
        return entities
    def all_entities(self):
        return self.save_from_file()

class Memory_Repository:
    def __init__(self,repository):
        self.taxi = repository.all_entities

    def append(self,entity):
        self.taxi.add(entity)
    def all_of_entities(self):
        return self.taxi()