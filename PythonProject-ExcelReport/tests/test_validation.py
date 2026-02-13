import pandas as pd
import pytest
from report.pipeline import *
from report.Exceptions.exceptions import *

def test_missing_column_raises_error():
    #DataSet without Prooduct_ID
    df = pd.DataFrame(
        {
            "Quantity_Sold":[10],
            "Unit_Price":[5]
        }
    )
    pipeline = SalesPipeline(df)
    with pytest.raises(DataValidationError):
        pipeline.validate()

