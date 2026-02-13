import logging
from report.base import *
class DataCleaner(DataProcessor):
    def clean(self):
        logging.info("Cleaning data")

        self.df=self.df.dropna()
        self.df=self.df.drop_duplicates()

        if self.df.empty:
            logging.info("Dataset is empty after cleaning")
            raise ValueError("Dataset is empty is empty after cleaning")

        return self.df