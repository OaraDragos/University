import matplotlib.pyplot as plt
import logging
class SalesVisualizer:
    def plot_top_products(self, summary ,top_n):
        logging.info(f"Generating plot for top {top_n} products")

        summary.head(top_n).plot(kind="bar",figsize=(10,6))
        plt.title(f"Top {top_n} Products by Total Sales")
        plt.tight_layout()
        plt.savefig("output/sales_chart.png")
        plt.close()