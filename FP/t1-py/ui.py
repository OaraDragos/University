from src.function import *

def menu_options():
    print("1)Add coffe")
    print("2)Display all coffe by origin")
    print("3)Filter coffe based on origin and price")
    print("4)Delete coffe by origin")
    print("5)Exit")
def user_interface():
    coffe_list = []
    coffe_list = initializate_3_coffes(coffe_list)
    print_coffe_list(coffe_list)
    print()

    while True:

        menu_options()
        user_choice = input("Enter your choice: ")
        user_choice=int(user_choice)
        if user_choice==1:
            try:
                    user_coffe_name = input("Enter your coffe name: ")
                    user_coffe_price = float(input("Enter your coffe price: "))
                    user_coffe_country = input("Enter your coffe country: ")
                    coffe_list=add_coffe(coffe_list,create_coffe(user_coffe_name,user_coffe_country,user_coffe_price))
            except ValueError as ve:
                    print(ve)
        if user_choice==2:
            try:
                print()
                new_coffe_list=sort_coffe_by_origin(coffe_list)
                print_coffe_list(new_coffe_list)
                print("done")
                print()
            except ValueError as ve:
                    print(ve)
        if user_choice==3:
            try:
                user_coffe_price = float(input("Enter your coffe price to be <= to: "))
                user_coffe_country = input("Enter your coffe country: ")
                coffe_list=filter_coffe_by_origin_and_price(coffe_list,user_coffe_country,user_coffe_price)
            except ValueError as ve:
                    print(ve)
        if user_choice==4:
            try:

                    user_coffe_country = input("Enter your coffe country to be deleted: ")
                    coffe_list=delete_all_coffe_with_origin(coffe_list,user_coffe_country)
            except ValueError as ve:
                    print(ve)
        if user_choice==5:
            print("exiting program...")
            break



        print_coffe_list(coffe_list)