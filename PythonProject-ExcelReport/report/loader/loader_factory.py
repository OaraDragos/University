from report.loader.loader_csv import CSVLoader
from report.loader.loader_excel import ExcelLoader

def get_loader(file_type:str):
    if file_type == "csv":
        return CSVLoader()
    elif file_type == "excel":
        return ExcelLoader()
    else:
        raise ValueError(f"Unsupported file type: {file_type}")