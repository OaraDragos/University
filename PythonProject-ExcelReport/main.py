import json
from report.cleaner import *
from report.analyzer import *
from report.visualizer import *
from report.loader.loader_factory import *
from report.logger import *
from report.pipeline import *
setup_logger()

#Load config
try:
    with open("config.json") as f:
        config = json.load(f)


    #Load data
    loader = get_loader(config["file_type"])
    df=loader.load(config["input_file"])

    #Process data
    pipeline=(SalesPipeline(df)
                               .validate()
                               .clean()
                               .add_total_sales()
                               .total_sales_by_product()
              )

    #Visualize
    SalesVisualizer().plot_top_products(pipeline.summary,config["top_n"])

except DataValidationError as e:
    logging.error(f"Pipeline failed: {e}")
except FileNotFoundError as e:
    logging.error(f"File error: {e}")
except Exception as e:
    logging.error(f"Unexpected error: {e}")

finally:
    logging.info("Finished")