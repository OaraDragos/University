from src.repository.board_repo import *
import random

class service_board:
    def __init__(self,repo):
        self.repo = repo
    def get_board(self):
        return self.repo.get_board()
    def get_board_xy(self,x,y):
        return self.repo.get_board_xy(x,y)
    def set_board_xy(self,x,y,value):
        self.repo.set_board_xy(x,y,value)
    def get_board_row(self,x):
        return self.repo.get_board_row(x)
    def make_asteroid(self,x,y):
        board=self.get_board()
        self.repo.set_board_xy(x,y,"*")
    def make_random_8_asteroids(self):
        for i in range(8):
            x=random.randint(0,6)
            y=random.randint(0,6)
            ok=True
            while ok==True:
                if self.get_board_xy(x,y)=="*" or self.get_board_xy(x,y+1)=="*" or self.get_board_xy(x,y-1)=="*" or self.get_board_xy(x,y)=="E" :
                    x=random.randint(0,6)
                    y=random.randint(0,6)
                else:
                    ok=False
            self.make_asteroid(x,y)
    def put_earth(self):
        self.set_board_xy(3,3,"E")
    def alien_ship_place(self):
        x=random.randint(0,6)
        y=random.randint(0,6)
        ok=True
        while ok==True:
            if self.get_board_xy(x,6)=="*" :
                x=random.randint(0,6)
            else:
                ok=False
        self.set_board_xy(x,6,"X")
        ok=True
        while ok==True:
            if self.get_board_xy(6,y)=="*" :
                y=random.randint(0,6)
            else:
                ok=False
        self.set_board_xy(6,y,"X")
    def fire(self,x,y):
        if x < 0 or x > 6 or y < 0 or y > 6:
            raise ValueError("Invalid position")
        if self.get_board_xy(x,y)=="*" or self.get_board_xy(x,y)=="-":
                raise ValueError("Invalid position")
        elif self.get_board_xy(x,y)=="X":
            self.set_board_xy(x,y,"-")
            return True
        else:
            self.set_board_xy(x,y,"-")
            return False
    def random_place_alien_ship(self):


            ok=True
            while ok==True:
                x=random.randint(0,6)
                y=random.randint(0,6)
                if self.get_board_xy(x,y)!="*" and self.get_board_xy(x,y)!="E":
                    self.set_board_xy(x,y,"X")
                    ok=False

    def move_alien_ship_one_step_closer_to_earth(self,x,y):
        board=self.get_board()

        #earth position 3,3

        if x>=4:
            x -=1
        elif x<=4:
            x +=1
        if y>=4:
            y -=1
        elif y<=4:
            y +=1
        if board[x][y]=="E":
            raise ValueError("Alien ship reached Earth")

        self.set_board_xy(x,y,"X")
        return x,y


    def move_alien_ship_random(self):
        board=self.get_board()
        for i in range(7):
            for j in range(7):
                if board[i][j]=="X" :
                    x=i
                    y=j
                    board[i][j]=0
                    n=random.randint(1,2)
                    if n==1:
                        self.move_alien_ship_one_step_closer_to_earth(x,y)
                    else:
                        self.random_place_alien_ship()

    def fire_assert(self,x,y):
        board=self.get_board()
        board[0][0]=0
        self.fire(0, 0)
        assert board[0][0]=="-"


