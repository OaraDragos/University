from report.cleaner import *
from report.analyzer import *
from report.Exceptions.exceptions import *

class SalesPipeline:
    REQUIRED_COLUMNS=["Product_ID","Quantity_Sold","Unit_Cost"]
    def __init__(self,df):
        self.df=df
        self.summary=None

    def validate(self):
        logging.info("Validating dataset")

        missing = [col for col in self.REQUIRED_COLUMNS
                   if col not in self.df.columns]
        if missing:
            logging.error(f"Missing required columns: {missing}")
            raise DataValidationError(f"Missing required columns: {missing}")

        if self.df.empty:
            logging.error("Dataset is empty")
            raise DataValidationError("Dataset is empty")

        return self

    def clean(self):
        self.df=DataCleaner(self.df).clean()
        return self
    def add_total_sales(self):
        self.df=SalesAnalyzer(self.df).add_total_sales()
        return self
    def total_sales_by_product(self):
        self.summary=SalesAnalyzer(self.df).total_sales_by_product()
        return self