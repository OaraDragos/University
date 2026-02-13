from src.repository import File_Repository,Memory_Repository
from math import sqrt
class Services:
    def __init__(self,repository):
        self.repository=repository
    def add(self,entity):
        if int(entity.id) <= 0:
            raise ValueError('Entity id must be greater than zero')
        if len(entity.name)<3:
            raise ValueError('Name must be at least 3 characters')
        if entity.x > 100 or entity.x < -100 or entity.y > 100 or entity.y < -100:
            raise ValueError("please enter a valid location for x and y")
        self.repository.add(entity)

    def all_taxies(self):
        return self.repository.all_of_entities

    def check_overlap(self,x,y):
        entities=self.all_taxies()
        for entity in entities:
            if x==entity.x and y==entity.y:
                return False
        return True
    def best_taxi_station(self):
        entities=self.all_taxies()
        number_of_entities =0
        bestx=0
        besty=0
        for entity in entities:
            bestx +=entity.x
            besty +=entity.y
            number_of_entities +=1
        best_location_x,best_location_y=bestx/number_of_entities ,besty/number_of_entities
        best_location_x=round(best_location_x)
        best_location_y=round(best_location_y)
        while self.check_overlap(best_location_x,best_location_y)==False:
            return best_location_x+1,best_location_y+1
        return best_location_x,best_location_y

    def distance_to_station(self,x,y):
        entities= self.all_taxies()
        distances=[]
        for entity in entities:
            distances.append(sqrt(pow(entity.x-x,2)+pow(entity.y-y,2)))
        distances,entities=self.sort(distances,entities)
        return distances,entities

    def sort(self,distances,entities):
        new_entities=[]
        i=1
        while i==1:
            i=0
            for j in range(len(distances)):
                if distances[j]>distances[j+1]:
                    distances[j],distances[j+1]=distances[j+1],distances[j]
                    entities[j],entities[j+1]=entities[j+1],entities[j]
                    i=1
        return distances,entities