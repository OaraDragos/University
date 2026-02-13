from src.service.board_service import  *
from src.repository.board_repo import *
from src.domain.domain_board import Board
import texttable
class User_interface:
    def __init__(self):
        self.board = service_board(Repository(InMemory()))
        self.board.make_random_8_asteroids()
        self.board.put_earth()
        self.board.alien_ship_place()
        self.letter_to_number = {"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"a":0,"b":1,"c":2,"d":3,"e":4,"f":5,"g":6}
        self.number_to_number={"1":0,"2":1,"3":2,"4":3,"5":4,"6":5,"7":6}
    def print_board(self):
        board = self.board.get_board()
        for i in range(7):
            for j in range(7):
                if board[i][j] == 0:
                    print(" ",end = " ")
                else:
                    print(board[i][j],end = " ")
            print()
    def print_board_texttable(self):
        board = self.board.get_board()
        t = texttable.Texttable()
        for i in range(7):
            row = []
            for j in range(7):
                if board[i][j] == 0:
                    row.append(" ")
                else:
                    row.append(board[i][j])
            t.add_row(row)
        print(t.draw())

    def print_board_texttable_with_letters_and_numbers_on_first_row_and_column(self):
        board = self.board.get_board()
        t = texttable.Texttable()
        t.add_row([" ","A","B","C","D","E","F","G"])
        for i in range(7):
            row = []
            row.append(i+1)
            for j in range(7):
                if board[i][j] == 0:
                    row.append(" ")
                else:
                    row.append(board[i][j])
            t.add_row(row)
        print(t.draw())
    def print_board_texttable_with_letters_and_numbers_on_first_row_and_column_without_alien(self):
        board = self.board.get_board()
        t = texttable.Texttable()
        t.add_row([" ","A","B","C","D","E","F","G"])
        for i in range(7):
            row = []
            row.append(i+1)
            for j in range(7):
                if board[i][j] == 0:
                    row.append(" ")
                elif board[i][j] == "X":
                    row.append(" ")
                elif board[i][j] == "-":
                    row.append("-")
                else:
                    row.append(board[i][j])
            t.add_row(row)
        print(t.draw())
    def print_board_texttable_without_alien(self):
            board = self.board.get_board()
            t = texttable.Texttable()
            for i in range(7):
                row = []
                for j in range(7):
                    if board[i][j] == 0:
                        row.append(" ")
                    elif board[i][j] != "X":
                        row.append(board[i][j])
                    else:
                        row.append(" ")
                t.add_row(row)
            print(t.draw())
    def print_board_without_alien(self):
        board = self.board.get_board()
        for i in range(7):
            for j in range(7):
                if board[i][j] == 0:
                    print(" ",end = " ")
                elif board[i][j] != "X":
                    print(board[i][j],end = " ")
                else:
                    print(" ",end = " ")
            print()
    def fire_input(self):
        try:
            user_input = input("Enter input(example G1): ") #example G1
            if user_input =="cheat":
                self.print_board_texttable_with_letters_and_numbers_on_first_row_and_column()
            else:

                y=user_input[0]  #G
                y=self.letter_to_number[y]
                x=user_input[1]  #1
                x=self.number_to_number[x]
                hit=self.board.fire(x,y)
                if hit == True:
                    print("Hit the alien!")
                else:
                    print("Missed!")
        except ValueError as ve:
                print(ve)
    def alien_move(self):
        try:
            self.board.move_alien_ship_random()
        except ValueError as ve:
            print(ve)
    def check_if_aliens_around_earth(self):
        board = self.board.get_board()
        for i in range(7):
            for j in range(7):
                if board[i][j] == "X" and ((i >=2 and j>=2) and (j <=4 and i<=4)):
                    return True
        return False



    def start(self):
        self.print_board_texttable_with_letters_and_numbers_on_first_row_and_column_without_alien()
        check_if_aliens = 1
        while True:
            self.fire_input()
            self.alien_move()
            self.check_if_aliens_around_earth()
            self.print_board_texttable_with_letters_and_numbers_on_first_row_and_column_without_alien()
            if self.check_if_aliens_around_earth() == True:
                self.print_board_texttable_with_letters_and_numbers_on_first_row_and_column()
                print("Game over")
                break
            check_if_aliens = 0
            for i in range(7):
                for j in range(7):
                    if self.board.get_board_xy(i,j)=="X":
                        check_if_aliens =1
            if check_if_aliens == 0:
                print("You won!")
                break








ui=User_interface()
ui.start()

# 1 2 3 4 5 6 7
# A B C D E F G
#1
#2
#3
#4
#5
#6
#7