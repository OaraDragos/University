from random import choice

from src.domain import Entity,Entities
from src.repository import File_Repository,Memory_Repository
from src.services import Services
class User_App:
    def __init__(self):
        file_repo=File_Repository("C:\\Users\\oarad\\PycharmProjects\\t2-Zed26-YT\\src\\adress_file")
        memory_repo=Memory_Repository(file_repo)
        self.services=Services(Entities())
    def print_menu(self):
        print("Menu")
        print("1.Add")
        print("2.Sorted list of adresses and distance to them")
        print("3.Best Taxi location for all adresses")
        print("4.show all")
        print("5.Exit")
    def add(self):
        while True:
            try:
                id=int(input("Enter ID: "))
                name=input("Enter name: ")
                number=int(input("Enter number: "))
                x=int(input("Enter x: "))
                y=int(input("Enter y: "))
                self.services.add(Entity(id, name, number, x, y))
            except ValueError as ve:
                print(ve)

    def show_all(self):
        entitie=Entities()
        entitie=self.services.all_taxies()
        for entity in entitie:
            print(f"{entity.id},{entity.name},{entity.number},{entity.x},{entity.y}")

    def where_to_put_taxi_station(self):
        x=int(input("Enter x: "))
        y=int(input("Enter y: "))
        distances,entities=self.services.distance_to_station(x, y)
        j=0
        for entity in entities:
            print(f"{entity.id},{entity.name},{entity.number},{x},{y}")
            print(distances[j])
            j=j+1
    def best_taxi_stationui(self):
        print("best location for taxi is:")
        resultx,resulty=self.services.best_taxi_station()
        print(f"This adress:{resultx},{resulty}")

    def application(self):
        self.print_menu()
        choice=input("enter your choice: ")
        choice=int(choice)
        while True:
            if choice == 1:
                self.add()
            elif choice == 2:
                self.where_to_put_taxi_station()
            elif choice == 3:
                self.best_taxi_stationui()
            elif choice == 4:
                self.show_all()
            elif choice == 5:
                print("Exiting")
                break