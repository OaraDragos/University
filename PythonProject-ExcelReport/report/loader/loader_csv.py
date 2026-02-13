import pandas as pd
from report.loader.loader_base import *
import logging

class CSVLoader(DataLoader):
    def load(self,path:str)->pd.DataFrame:
        logging.info(f"Loading CSV file: {path}")
        try:
            return pd.read_csv(path)
        except FileNotFoundError:
            logging.error(f"File not found: {path}")
            raise