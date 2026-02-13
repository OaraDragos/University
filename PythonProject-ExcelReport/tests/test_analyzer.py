import pandas as pd
from report.analyzer import *
def test_total_sales_calculation():
    df=pd.DataFrame({
        "Product_ID":[1],
        "Quantity_Sold":[10],
        "Unit_Price":[5]
    })
    analyzer = SalesAnalyzer(df)
    result =analyzer.add_total_sales()

    assert result["Total_Sales"].iloc[0] == 50

def test_total_sales_by_product():
    df=pd.DataFrame(
        {
            "Product_ID":[2,2],
            "Quantity_Sold":[7,8],
            "Unit_Price":[5,5]
        }
    )
    analyzer = SalesAnalyzer(df)
    df=analyzer.add_total_sales()
    summary = analyzer.total_sales_by_product()

    assert summary.iloc[0]==75