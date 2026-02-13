class Repository:
    def __init__(self,type_repo):
        self.boards = type_repo
    def get_board(self):
        return self.boards.board
    def get_board_xy(self,x,y):
        if x < 0 or x > 6 or y < 0 or y > 6:
            return None
        return self.boards.board[x][y]
    def set_board_xy(self,x,y,value):
        self.boards.board[x][y] = value
    def get_board_row(self,x):
        return self.boards.board[x]


class InMemory:
    def __init__(self):
        self.board = [[0 for _ in range(7)] for _ in range(7)]
    def get_board(self):
        return self.board
    def get_board_xy(self,x,y):
        return self.board[x][y]
    def set_board_xy(self,x,y,value):
        self.board[x][y] = value
    def get_board_row(self,x):
        return self.board[x]