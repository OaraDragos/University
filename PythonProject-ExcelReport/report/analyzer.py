from report.base import DataProcessor
import logging
class SalesAnalyzer(DataProcessor):
    def add_total_sales(self):
        logging.info("Calculating total sales")

        self.df["Total_Sales"] = (
            self.df["Quantity_Sold"] * self.df["Unit_Price"]
        )
        return self.df

    def total_sales_by_product(self):
        logging.info("Aggregating total sales by product")

        return (
            self.df.groupby("Product_ID")["Total_Sales"]
            .sum()
            .sort_values(ascending=False)
        )
