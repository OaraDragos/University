import pandas as pd
from abc import ABC,abstractmethod
class DataLoader(ABC):
    @abstractmethod
    def load(self, path:str)->pd.DataFrame:
        pass