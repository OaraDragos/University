class Entity:
    def __init__(self,id,name,number,x:int,y:int):
        self.id = id
        self.name = name
        self.number = number
        self.x = x
        self.y = y
    def __repr__(self):
        return f"{self.id},{self.name},{self.number},{self.x},{self.y}"

class Entities:
    def __init__(self):
        self.entities = []
    def add(self,entity):
        self.entities.append(entity)

    def all_entities(self):
        return self.entities



'''len(name) > 3'''