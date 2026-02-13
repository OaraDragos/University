from report.loader.loader_base import *
class ExcelLoader(DataLoader):
    def load(self,path:str)->pd.DataFrame:
        return pd.read_excel(path)